import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/slice/authSlice';
import * as Messages from '../../components/Message/Message';
import BreadCrumbComponent from '../../components/BreadcrumbComponent/BreadcrumbComponent';
import AvatarUploadComponent from "../../components/AvatarUploadComponent/AvatarUploadComponent";
import ProfileComponent from '../../components/ProfileComponent/ProfileComponent';
import ChangePasswordComponent from '../../components/ChangePasswordComponent/ChangePasswordComponent';
import DefaultLayout from '../../components/DefaultLayout/DefaultLayout';
import * as AuthService from '../../services/AuthService';
import * as StudentService from '../../services/StudentService';
import * as CategoryService from '../../services/CategoryService';
import * as MajorService from '../../services/MajorService';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Container,
  Sidebar,
  Avatar,
  UserName,
  Menu,
  MenuItem,
  Main,
  Card,
  Title,
} from './style';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // Lấy thông tin người dùng từ Redux store
  const [activeTab, setActiveTab] = useState('profile');

  // Lấy thông tin profile để hiển thị
  const getUserProfile = useQuery({
    queryKey: ['userProfile'],
    queryFn: AuthService.getUserProfile,
    refetchOnWindowFocus: false,
  });
  const { data: userProfile } = getUserProfile;
  const profile = userProfile?.data;
  console.log('User Profile:', profile);
  // Lấy danh sách khoa để gửi vào component
  const getDepartments = useQuery({
    queryKey: ['departments'],
    queryFn: CategoryService.getCategories,
    refetchOnWindowFocus: false,
  });
  const departments = getDepartments?.data?.data || [];
  // Lấy danh sách ngành để gửi vào component
  const getMajors = useQuery({
    queryKey: ['majors'],
    queryFn: MajorService.getAllMajors,
    refetchOnWindowFocus: false,
  });
  const majors = getMajors?.data?.data || [];

  // Cập nhật thông tin người dùng
  const mutationUpdateUserProfile = useMutation({
    mutationFn: ({ id, data }) => StudentService.updateStudent(id, data),
    onSuccess: (data) => {
      Messages.success('Cập nhật thông tin thành công');
      dispatch(updateUser(data.data));
    },
    onError: (error) => {
      Messages.error(error?.response?.data?.message || 'Cập nhật thông tin thất bại');
    },
  });

  const handleUpdateProfile = (data) => {
    mutationUpdateUserProfile.mutate({
      id: user?.id,
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        major: data.major,
        mssv: data.mssv,
        staffId: data.staffId,
      },
    });
    // Reload dữ liệu ngay sau khi cập nhật
    setTimeout(() => {
      getUserProfile.refetch();
    }, 50);
  };

  // Đổi mật khẩu
  const mutationChangePassword = useMutation({
    mutationFn: AuthService.changePassword,
    onSuccess: () => {
      Messages.success('Đổi mật khẩu thành công');
    },
    onError: (error) => {
      Messages.error(error?.response?.data?.message || 'Đổi mật khẩu thất bại');
    },
  });
  const handleChangePassword = (data) => {
    mutationChangePassword.mutate(data);
  };

  // Cập nhật avatar
  const mutationUpdateAvatar = useMutation({
    mutationFn: ({ id, formData }) => StudentService.updateAvatar(id, formData),
    onSuccess: async () => {
      Messages.success('Cập nhật avatar thành công');
      await getUserProfile.refetch();
    },
    onError: (error) => {
      Messages.error(error?.response?.data?.message || 'Cập nhật avatar thất bại');
    },
  });
  const handleUpdateAvatar = (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    mutationUpdateAvatar.mutate({
      id: profile?._id,
      formData,
    });
  };

  // Đăng xuất
  const handleLogout = () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất?')) return;
    AuthService.logout();
    Messages.success('Đăng xuất thành công');
  };

  /** UI render */
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <ProfileComponent
              user={profile}
              departments={departments}
              majors={majors}
              onUpdate={handleUpdateProfile}
            />
          </>
        );
      case 'password':
        return (
          <>
            <ChangePasswordComponent onChangePassword={handleChangePassword} />
          </>
        );
      case 'security':
        return (
          <>
            <Title>Bảo mật</Title>
            <p>Cài đặt bảo mật (2FA, session management, v.v...)</p>
          </>
        );
      case 'notifications':
        return (
          <>
            <Title>Thông báo</Title>
            <p>Quản lý thông báo email, push notification, ...</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
  <DefaultLayout>
    <BreadCrumbComponent
      customNameMap={{ profile: "Hồ sơ" }}
    />
    <Container>
      {/* Sidebar */}
      <Sidebar>
          <AvatarUploadComponent
            avatarUrl={`${import.meta.env.VITE_API_URL}${profile?.avatar}`}
            onUpdateAvatar={handleUpdateAvatar}
          />
          {/* <UserName>
            {profile?.name || "User"}
          </UserName> */}
        <Menu>
          <MenuItem
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          >
            <UserOutlined /> Thông tin tài khoản
          </MenuItem>
          <MenuItem
            active={activeTab === "password"}
            onClick={() => setActiveTab("password")}
          >
            <LockOutlined /> Đổi mật khẩu
          </MenuItem>
          <MenuItem
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          >
            <SafetyCertificateOutlined /> Bảo mật
          </MenuItem>
          {/* <MenuItem
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
          >
            <BellOutlined /> Thông báo
          </MenuItem> */}
          <MenuItem onClick={handleLogout} className="text-red-500">
            <LogoutOutlined /> Đăng xuất
          </MenuItem>
        </Menu>
      </Sidebar>

      {/* Main content */}
      <Main>
        <Card
          className="shadow-lg rounded-2xl p-6 bg-white transition-all"
        >
          {renderContent()}
        </Card>
      </Main>
    </Container>
  </DefaultLayout>
);  
};

export default ProfilePage;
