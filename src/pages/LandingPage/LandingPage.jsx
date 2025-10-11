import React from 'react'
import Header from '../../components/landing/Header'
import Hero from '../../components/landing/Hero'
import Features from '../../components/landing/Features'
import { Testimonials } from '../../components/landing/Testimonials'

const LandingPage = () => {
  return (
    <div className='bg-[#ffffff] text-gray-600'> 
      <Header />
      <main className="mb-[100vh]">
        <Hero />
        <Features />
        <Testimonials />
      </main>

    </div>
  )
}

export default LandingPage