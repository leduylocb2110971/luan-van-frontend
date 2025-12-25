import RegisterForm from "../../components/FormRegister/FormRegister";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import * as AuthService from "../../services/AuthService";
import * as Message from "../../components/Message/Message";
import { AuthWrapper } from "./style";
import { Typography } from "antd";

const RegisterPage = () => {
  const navigate = useNavigate();

  const mutationRegister = useMutation({
    mutationFn: (data) => AuthService.registerUser(data),
    onSuccess: (data) => {
      if(data?.status === 'error') {
        Message.error(data?.message);
        return;
      }
      Message.success(data?.message);
      navigate("/login");
    },
  });

  return (
    <AuthWrapper>
          <RegisterForm
            isPending={mutationRegister.isLoading}
            onSubmit={(data) => mutationRegister.mutate(data)}
          />
    </AuthWrapper>
  );
};

export default RegisterPage;
