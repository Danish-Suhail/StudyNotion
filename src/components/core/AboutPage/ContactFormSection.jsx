import React from 'react'
import ContactUsForm from '../../common/ContactPage/ContactUsForm'

const ContactFormSection = () => {
  return (
    <div className='mx-auto'>
        <h1>
            Get in Touch
        </h1>
        <p>We'd love to hear fromyou. Please fill out this form.</p>
        <div>
            <ContactUsForm />
        </div>
    </div>
  )
}

export default ContactFormSection