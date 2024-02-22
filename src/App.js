import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./Pages/Home.jsx"
import Navbar from "./components/common/Navbar.jsx";
import OpenRoute from "./components/core/Auth/OpenRoute"

import Login from './Pages/Login.jsx'
import Signup from './Pages/Signup.jsx'
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import UpdatePassword from "./Pages/UpdatePassword.jsx";
import VerifyEmail from "./Pages/VerifyEmail.jsx";
import About from "./Pages/About.jsx";
import MyProfile from "./components/core/Dashboard/MyProfile.jsx";
import PrivateRoute from "./components/core/Auth/PrivateRoute.jsx";
import Error from './Pages/Error.jsx'
import Instructor from "./components/core/Dashboard/Instructor"
import  Dashboard from './Pages/Dashboard.jsx'
import Contact from "./Pages/Contact.jsx";
import Settings from "./components/core/Dashboard/Settings";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses.jsx";
import Cart from './components/core/Dashboard/Cart'
import { ACCOUNT_TYPE } from "./utils/constants.js";
import { useSelector } from "react-redux";
import AddCourse from "./components/core/Dashboard/AddCourse/index.js";
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./components/core/Dashboard/EditCourse";
import Catalog from "./Pages/Catalog.jsx";
import CourseDetails from "./Pages/CourseDetails.jsx";
import ViewCourse from "./Pages/ViewCourse.jsx";
import VideoDetails from "./components/core/ViewCourse/VideoDetails";

function App() {

  const {user} = useSelector((state)=> state.profile)
  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar/>
      <Routes>
        <Route path="/" element = {<Home />} />
        <Route path="catalog/:catalogName" element={<Catalog/>} />
        <Route path="courses/:courseId" element={<CourseDetails/>} />

        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
    <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
      
      <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />
        <Route
          path="about"
          element={
            // <OpenRoute>
              <About />
            // </OpenRoute>
          }
        />
        <Route
          path="contact"
          element={
            // <OpenRoute>
              <Contact />
            // </OpenRoute>
          }
        />
        <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="dashboard/my-profile" element={<MyProfile />}/>
          <Route path="dashboard/Settings" element={<Settings />} />

          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
              <Route path="dashboard/cart" element={<Cart />} />
              <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />

              </>
            ) 
          }
          {
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
              <Route path="dashboard/instructor" element={<Instructor />} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route path="dashboard/my-courses" element={<MyCourses />} />
              <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
              </>
            ) 
          }
        </Route>

        <Route element={
        <PrivateRoute>
          <ViewCourse />
        </PrivateRoute>
      }>

      {
        user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
          <Route 
            path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
            element={<VideoDetails />}
          />
          </>
        )
      }

      </Route>

        <Route path="*" element = {<Error />} />
      </Routes>
      
    </div>
  );
}

export default App;
