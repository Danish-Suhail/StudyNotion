import { Password } from '@mui/icons-material'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { resetPassword } from '../services/operations/authAPI'
import { Link, useLocation } from 'react-router-dom'
import { FaEye, FaEyeSlash } from "react-icons/fa";


const UpdatePassword = () => {
    const [formData, setFormData] = useState({
        password:"",
        confirmPassword:"",
    })
    const dispatch = useDispatch();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const {loading} = useSelector((state) => state.auth)

    const {password, confirmPassword} = formData;

    const handleOnChange = (e) =>{
        setFormData((prevData)=>(
            {
                ...prevData,[e.target.name]: e.target.value,
            }
        ))
    }

    const handleOnSubmit = (e) =>{
        e.preventDefault();
        const token = location.pathname.split('/').at(-1);
        dispatch(resetPassword(password, confirmPassword, token));
    }

  return (
    <div>
        {
            loading ? (
                <div>
                    Loading..
                </div>
            ) :
            (
                <div>
                    <h1>
                        Choose New Password
                    </h1>
                    <p>Almost done. Enter new password and you're all set.</p>
                    <form onSubmit={handleOnSubmit}>
                        <label>
                            <p>New password*</p>
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                name ='password'
                                value={password}
                                onChange={handleOnChange}
                                placeholder='password'
                            />
                            <span onClick={() => setShowPassword((prev)=> !prev)}>
                                {
                                    showPassword ? <FaEyeSlash fontSize={24}/> : <FaEye fontSize={24}/>
                                }
                            </span>
                        </label>
                        <label>
                            <p>Confirm New password*</p>
                            <input
                                required
                                type={showConfirmPassword ? "text" : "password"}
                                name ='confirmPassword'
                                value={confirmPassword}
                                onChange={handleOnChange}
                                placeholder='confirmPassword'
                            />
                            <span onClick={() => setShowConfirmPassword((prev)=> !prev)}>
                                {
                                    showConfirmPassword ? <FaEyeSlash fontSize={24}/> : <FaEye fontSize={24}/>
                                }
                            </span>
                        </label>
                        <button type='submit'>
                            Reset password
                        </button>
                    </form>
                    <div>
                            <Link to = '/login'>
                            <p>Back to Login</p>

                            </Link>
                        </div>
                </div>
            )
        }
    </div>
  )
}

export default UpdatePassword