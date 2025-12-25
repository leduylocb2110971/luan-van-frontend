import LoginForm from "../../components/FormLogin/FormLogin";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import * as AuthService from "../../services/AuthService";
import * as StudentService from "../../services/StudentService";
import { setUser, updateUser } from "../../redux/slice/authSlice";
import { jwtDecode } from "jwt-decode";
import * as Message from "../../components/Message/Message";
import { AuthWrapper } from "./style";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Lấy tham số từ URL nếu có
  const [searchParams] = useSearchParams(); // <--- THÊM DÒNG NÀY

  const getDetailUser = async (id, access_token) => {
    const res = await StudentService.getStudentById(id);
    console.log("User details:", res);
    if (res) {
      const { email, name, role, avatar } = res;
      let user = {};
      if(role === 'student') {
        const { mssv } = res;
        user = { id, access_token, mssv, email, name, role, avatar };
      } else if (role === 'lecturer') {
        const { staffId } = res;
        user = { id, access_token, staffId, email, name, role, avatar };
      } else {
        user = { id, access_token, email, name, role, avatar };
      }
 
      dispatch(updateUser(user));
      return role;
    }
    return null;
  };

  const mutationLogin = useMutation({
    mutationFn: (data) => AuthService.loginUser(data),
    onSuccess: async (data) => {
      if(data?.status === 'error') {
        Message.error(data?.message);
        return;
      }

      if (data?.accessToken) {
        const decode = jwtDecode(data.accessToken);
        const { id } = decode;
        dispatch(setUser({ id, access_token: data.accessToken }));
        const role = await getDetailUser(id, data.accessToken);
        console.log('role', role);
        if (role === "admin") 
          navigate ("/admin/dashboard");
        else{
          const redirectPath = searchParams.get("redirect"); // Lấy đường dẫn cũ từ tham số URL
          if (redirectPath) {
              // Nếu có link cũ cần quay lại thì ưu tiên số 1
              navigate(redirectPath);
          } else {
              // Nếu không có thì mới chạy logic mặc định cũ
              navigate("/");
          }
        }

        
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      Message.error( error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại." );
    },
  });

  return (
    <AuthWrapper>
      <LoginForm
        isPending={mutationLogin.isLoading}
        onSubmit={(data) => mutationLogin.mutate(data)}
      />
    </AuthWrapper>
  );
};

export default LoginPage;
