import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//Nhúng component
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import AdminLayout from "../components/AdminLayout/AdminLayout";
import AuthenticationPage from "../pages/AuthenticationPage/AuthenticationPage";
import HomePage from "../pages/UserPage/HomePage/HomePage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";


//Nhúng các page
import Dashboard from "../pages/AdminPage/Dashboard";
import Student from "../pages/AdminPage/Students";
import Lecture from "../pages/AdminPage/Lecturers";
import Category from "../pages/AdminPage/Category";
import TheSis from "../pages/AdminPage/TheSis";
import Major from "../pages/AdminPage/Major";
import Field from "../pages/AdminPage/Field";
import Comment from "../pages/AdminPage/Comment";
import Notification from "../pages/AdminPage/Notification";
import PendingThesisPage from "../pages/AdminPage/PendingThesisPage";
import ApprovedThesisPage from "../pages/AdminPage/ApprovedThesisPage";
import RequestSharePage from "../pages/AdminPage/RequestSharePage";
import ShareRequestHistoryPage from "../pages/AdminPage/ShareRequestHistoryPage";
import Recyclebin from "../pages/AdminPage/Recyclebin";

import MyThesisPage from "../pages/UserPage/MyThesisPage/MyThesisPage";
import ShareRequestThesesStudentPage from "../pages/UserPage/ShareRequestThesesPage/ShareRequestThesesPage";
import FavoriteThesesListPage from "../pages/UserPage/FavoriteThesesListPage/FavoriteThesesListPage";
import AuthorPage from "../pages/UserPage/AuthorPage/AuthorPage";
import AuthorDetailPage from "../pages/UserPage/AuthorDetailPage/AuthorDetailPage";

import LecturerLayout from '../components/LecturerLayout/LecturerLayout';
import SupervisedThesePage from "../pages/SupervisorPage/SupervisedThesesPage/SupervisedThesesPage";
import ShareRequestThesesPage from "../pages/SupervisorPage/ShareRequestThesesPage/ShareRequestThesesPage";
import DashboardSupervisorPage from "../pages/SupervisorPage/DashboardSupevisorPage/DashboardSupervisorPage";
import ThesisStatisticsPage from "../pages/SupervisorPage/ThesisStatisticsPage/ThesisStatisticsPage";
import AllThesesPage from "../pages/SupervisorPage/AllThesesPage/AllThesesPage";
import ThesisEditingPage from "../pages/SupervisorPage/ThesisEditingPage/ThesisEditingPage";
import AllSupervisorsPage from "../pages/SupervisorPage/AllSupervisorsPage/AllSupervisorsPage";

import CategoryThesisListPage from "../pages/UserPage/CategoryThesisListPage/CategoryThesisListPage";
import UploadThesisPage from "../pages/UserPage/UploadThesisPage/UploadThesisPage";
import ThesisListPage from "../pages/UserPage/ThesisListPage/ThesisListPage";
import ThesisDetailPage from "../pages/UserPage/TheSisDetailPage/ThesisDetailPage";
import ViewHistoryPage from "../pages/UserPage/ViewHistoryPage/ViewHistoryPage";
import SearchResultPage from "../pages/UserPage/SearchResultPage/SearchResultPage";
import NotificationPage from "../pages/NotificationPage/NotificationPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import LoginPage from "../pages/LoginPage/LoginPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ContactPage from "../pages/UserPage/ContactPage/ContactPage";

//Định nghĩa các route
const AppRoute = () => {
    return (
        <Router>
            <Routes>
                {/* 1. ADMIN */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index path="dashboard" element={<Dashboard/>} />
                    <Route path="students" element={<Student />} />
                    <Route path="lecturers" element={<Lecture />} />
                    <Route path="major" element={<Major />} />
                    <Route path="field" element={<Field />} />
                    <Route path="comments" element={<Comment />} />
                    <Route path="notification" element={<Notification />} />
                    <Route path="category" element={<Category />} />
                    <Route path="thesis" element={<TheSis />} />
                    <Route path="thesis/:id" element={<ThesisEditingPage />} />                    
                    <Route path="pending-thesis" element={<PendingThesisPage />} />
                    <Route path="approved-thesis" element={<ApprovedThesisPage />} />
                    <Route path="request-share" element={<RequestSharePage />} />
                    <Route path="share-request-history" element={<ShareRequestHistoryPage />} />
                    <Route path="recyclebin" element={<Recyclebin />} />
                </Route>
                {/* 2. LECTURER */}
                <Route path="/lecturer" element={
                    <ProtectedRoute allowedRoles={['lecturer']}>
                        <LecturerLayout />
                    </ProtectedRoute>
                }> 
                    <Route path="supervised" element={<SupervisedThesePage />} />
                    <Route path="share-requests" element={<ShareRequestThesesPage />} />
                    <Route index path="dashboard" element={<DashboardSupervisorPage />} />
                    <Route path="thesis-statistics" element={<ThesisStatisticsPage />} />
                    <Route path="all-theses" element={<AllThesesPage />} />
                    <Route path="all-supervisors" element={<AllSupervisorsPage />} />
                </Route>
                {/* 3. PUBLIC: AI CŨNG VÀO ĐƯỢC */}
                <Route path="/authentication" element={<AuthenticationPage/>}/>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<HomePage/>} />
                <Route path="/search" element={<SearchResultPage />} />
                <Route path="/thesis" element={<ThesisListPage />} />
                <Route path="/supervisors" element={<AuthorPage />} />                
                <Route path="/supervisors/:id" element={<AuthorDetailPage />} />
                <Route path="/category/:id" element={<CategoryThesisListPage />} />
                <Route path="/thesis/:id" element={<ThesisDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* 4. ĐĂNG NHẬP RỒI MỚI VÀO ĐƯỢC */}
                <Route element ={<ProtectedRoute />}>
                    <Route path="/my-thesis" element={<MyThesisPage />} />
                    <Route path="/share-requests" element={<ShareRequestThesesStudentPage />} />
                    <Route path="/favorite-theses" element={<FavoriteThesesListPage />} />
                    <Route path="/history" element={<ViewHistoryPage />} />
                    <Route path="/upload" element={<UploadThesisPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notification" element={<NotificationPage />} />
                </Route>
                
                {/* 5. NẾU KHÔNG TÌM THẤY TRANG, HIỂN THỊ TRANG 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
            
        </Router>
    );
};
export default AppRoute;