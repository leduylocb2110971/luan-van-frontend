import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import * as AuthService from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import * as StudentService from "../../services/StudentService";
import { setUser, updateUser } from "../../redux/slice/authSlice";
import { jwtDecode } from "jwt-decode";
import * as Message from "../../components/Message/Message";

const GoogleLoginButtonComponent = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
    const mutationLogin = useMutation({
        mutationFn: (tokenId) => AuthService.registerGoogle(tokenId),
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
            if (role === "admin") navigate("/admin/dashboard");
            else navigate("/");
          }
        },
      });   

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
                onSuccess={credentialResponse => {
                    mutationLogin.mutate(credentialResponse.credential);
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginButtonComponent;