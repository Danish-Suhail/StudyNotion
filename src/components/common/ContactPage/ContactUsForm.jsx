import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import {contactusEndpoint} from '../../../services/apis'
import CountryCode from '../../../data/countrycode.json'


const ContactUsForm = () => {


    const [loading, setLoading] = useState(false);
    const {register, handleSubmit, reset, formState:{errors, isSubmitSuccessful}} = useForm();

    const submitContactForm = async(data)=>{
        console.log("logging Data", data);
        try{
            setLoading(true);
            // const response = await apiConnector("POST", contactusEndpoint.CONTACT_US_API,data)
            const response = {status:'OK'};
            console.log("Logging response", response);
            setLoading(false);
        }
        catch(error){
            console.log("Error", error.message);
            setLoading(false);
        }
    }

    useEffect(()=>{
        if(isSubmitSuccessful){
            reset({
                email:'',
                firstName:'',
                lastName:"",
                message:"",
                phoneNo:'',
            })
        }
    },[reset,isSubmitSuccessful]);



  return (
    <form className="flex flex-col gap-7" onSubmit={handleSubmit(submitContactForm)}>
    <div className="flex flex-col gap-5 lg:flex-row">
        <div className="flex flex-col gap-2 lg:w-[48%]">
            {/* firstName */}
            {/* <div className='flex flex-col'> */}
                <label htmlFor='firstName'>First Name</label>
                <input 
                    type='text'
                    name='firstName'
                    id='firstName'
                    className="form-style"
                    placeholder='Enter first name'
                    {...register('firstName',{required:true})}
                />
                {
                    errors.firstName && (
                        <span className="-mt-1 text-[12px] text-yellow-100">Please enter your name</span>
                    )
                }
            </div>
            {/* lastName */}
            <div className='flex flex-col gap-2 lg:w-[48%]'>
                <label htmlFor='lastName' className="lable-style">Last Name</label>
                <input 
                    type='text'
                    name='lastName'
                    id='lastName'
                    placeholder='Enter Last name'
                    className="form-style"
                    {...register('lastName')}
                />
            </div>
        </div>
        {/* email */}
            <div className="flex flex-col gap-2">
                <label className="lable-style" htmlFor='email'>Email Address</label>
                <input
                    type='email'
                    name='email'
                    id='email'
                    className="form-style"
                    placeholder='Enter email Address'
                    {...register('email',{required:true})}
                />
                {
                    errors.email && (
                        <span className="-mt-1 text-[12px] text-yellow-100">
                            Please enter your email Address
                        </span>
                    )
                }
            </div>
        {/* PhoneNo */}
        <div className='flex flex-col gap-2'>
            <label htmlFor='phoneNumber' className="lable-style">
                Phone Number
            </label>
            <div className='flex gap-5'>
                {/* dropdown */}
                <div className='flex w-[81px] flex-col gap-2'>
                    <select
                    name='dropdown'
                    type="text"
                    className="form-style"
                    placeholder="Enter first name"
                    id='dropdown'
                    {...register('countryCode', {required:true})}
                    >
                        {
                            CountryCode.map((element, index)=>{
                                return (
                                    <option key={index} value={element.code}>
                                        {element.code} - {element.country}
                                    </option>
                                )
                            })
                        }
                    </select>
                </div>

                <div className='flex w-[calc(100%-90px)] flex-col gap-2'>
                    <input 
                        type='number'
                        name='phoneNumber'
                        id='phoneNumber'
                        placeholder='1234567890'
                        className='form-style'
                        {...register('phoneNo', 
                        {required:{value:true, message:"Please enter phone number"}, 
                        maxLength:{value:10, message:"Invalid Phone number"}, 
                        minLength:{value:8, message:"Invalid Phone number"}})}
                    />
                </div>
                </div>
                <div>
                    {errors.phoneNo && (
                        <span className="-mt-1 text-[12px] text-yellow-100">
                            {errors.phoneNo.message}
                        </span>
                    )}
                </div>
                
        {/* message */}
            <div className='flex flex-col gap-2'>
                <label htmlFor='message' className="lable-style">Message</label>
                <textarea 
                    name='message'
                    id='message'
                    cols='30'
                    rows='7'
                    className="form-style"
                    placeholder='Enter your message here'
                    {...register('message',{required:true})}
                />
                {
                    errors.message && (
                        <span className="-mt-1 text-[12px] text-yellow-100">Please enter your message.</span>
                    )
                }
            </div>
    </div>
        <button type='submit'
        disabled={loading}
        className={`rounded-md bg-yellow-50 px-6 py-3 text-center text-[13px] font-bold text-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.18)] 
         ${
           !loading &&
           "transition-all duration-200 hover:scale-95 hover:shadow-none"
         }  disabled:bg-richblack-500 sm:text-[16px] `}>
                Send Message
        </button>
    </form>
  )
}

export default ContactUsForm