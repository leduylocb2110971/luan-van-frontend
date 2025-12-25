import FormLogin from "../../components/FormLogin/FormLogin";
import FormRegister from "../../components/FormRegister/FormRegister";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Message from "../../components/Message/Message";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import * as AuthService from "../../services/AuthService";
import * as StudentService from "../../services/StudentService";
import { setUser, updateUser } from "../../redux/Slice/authSlice";
import { jwtDecode } from "jwt-decode";
import { AuthWrapper } from "./style";

const AuthenticationPage = ({ type }) => {
  // type = "login" hoặc "register", có thể lấy từ route
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.state?.message) {
      Message.warning(location.state.message);
    }
  }, [location.state]);

  const getDetailUser = async (id, access_token) => {
    const res = await StudentService.getStudentById(id);
    if (res) {
      const { email, name, role } = res;
      const user = { id, access_token, email, name, role };
      dispatch(updateUser(user));
      return role;
    }
    return null;
  };

  const mutationAuth = useMutation({
    mutationFn: (data) => {
      if (type === "register") return AuthService.registerUser(data);
      return AuthService.loginUser(data);
    },
    onSuccess: async (data) => {
      Message.success(data?.message);
      if (type === "login" && data?.accessToken) {
        const decode = jwtDecode(data.accessToken);
        const { id } = decode;
        dispatch(setUser({ id, access_token: data.accessToken }));
        const role = await getDetailUser(id, data.accessToken);
        if (role === "admin") navigate("/admin/dashboard");
        else navigate("/");
      } else if (type === "register") {
        // sau khi đăng ký thành công, chuyển sang login
        navigate("/login");
      }
    },
    onError: (error) => {
      Message.error(error.message);
    },
  });

  return (
    <AuthWrapper>
      {type === "register" ? (
        <FormRegister
          isPending={mutationAuth.isLoading}
          onSubmit={(data) => mutationAuth.mutate(data)}
        />
      ) : (
        <FormLogin
          isPending={mutationAuth.isLoading}
          onSubmit={(data) => mutationAuth.mutate(data)}
        />
      )}
    </AuthWrapper>
  );
};

export default AuthenticationPage;
