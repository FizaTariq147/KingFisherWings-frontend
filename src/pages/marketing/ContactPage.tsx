import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2, Mail, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'
import Navbar from '@/components/marketing/Navbar'
import Footer from '@/components/marketing/Footer'
import { REGIONAL_CONTACTS } from '@/constants/marketingData'

const contactSchema = z.object({
  name:    z.string().min(2,  'Enter your full name'),
  email:   z.string().email('Enter a valid email'),
  company: z.string().min(2,  'Enter your company name'),
  country: z.string().min(2,  'Select your country'),
  message: z.string().min(10, 'Enter a message (min 10 characters)'),
})
type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema), mode: 'onTouched' })

  const onSubmit = async (_values: ContactFormValues) => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1200)) // replace with real API call
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-[#F7F8FA] py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold text-[#0EA5E9] uppercase tracking-widest mb-3">
                Contact
              </p>
              <h1 className="text-4xl font-medium text-gray-900 mb-4">
                Book a free demo
              </h1>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Talk to our team and see how Fresa Gold fits your operation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Form */}
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                {submitted ? (
                  <div className="flex flex-col items-center text-center py-8">
                    <CheckCircle2 size={40} className="text-[#0EA5E9] mb-4" />
                    <h2 className="text-xl font-medium text-gray-900 mb-2">
                      Thanks, we'll be in touch!
                    </h2>
                    <p className="text-sm text-gray-500">
                      Our team will contact you within one business day.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        disabled={isLoading}
                        aria-invalid={!!errors.name}
                        {...register('name')}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] disabled:opacity-50 transition-colors"
                      />
                      {errors.name && (
                        <p role="alert" className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="c-email" className="block text-sm font-medium text-gray-700 mb-1">
                        Work email
                      </label>
                      <input
                        id="c-email"
                        type="email"
                        placeholder="you@company.com"
                        disabled={isLoading}
                        aria-invalid={!!errors.email}
                        {...register('email')}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] disabled:opacity-50 transition-colors"
                      />
                      {errors.email && (
                        <p role="alert" className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Company + Country grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                          Company
                        </label>
                        <input
                          id="company"
                          type="text"
                          placeholder="Your company"
                          disabled={isLoading}
                          aria-invalid={!!errors.company}
                          {...register('company')}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] disabled:opacity-50 transition-colors"
                        />
                        {errors.company && (
                          <p role="alert" className="mt-1 text-xs text-red-600">{errors.company.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          id="country"
                          type="text"
                          placeholder="UAE"
                          disabled={isLoading}
                          aria-invalid={!!errors.country}
                          {...register('country')}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] disabled:opacity-50 transition-colors"
                        />
                        {errors.country && (
                          <p role="alert" className="mt-1 text-xs text-red-600">{errors.country.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        placeholder="Tell us about your team and what you're looking for..."
                        disabled={isLoading}
                        aria-invalid={!!errors.message}
                        {...register('message')}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] disabled:opacity-50 transition-colors resize-none"
                      />
                      {errors.message && (
                        <p role="alert" className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      aria-busy={isLoading}
                      className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-60 text-white text-sm font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader2 size={14} className="animate-spin" />}
                      {isLoading ? 'Sending…' : 'Send message'}
                    </button>
                  </form>
                )}
              </div>

              {/* Contact info */}
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-5">Get in touch</h2>
                  <div className="flex flex-col gap-4">
                    <a
                      href="mailto:sales@fresatechnologies.com"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#0EA5E9] transition-colors"
                    >
                      <div className="w-9 h-9 bg-[#E0F2FE] rounded-lg flex items-center justify-center shrink-0">
                        <Mail size={15} className="text-[#0EA5E9]" />
                      </div>
                      sales@fresatechnologies.com
                    </a>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-9 h-9 bg-[#E0F2FE] rounded-lg flex items-center justify-center shrink-0">
                        <MapPin size={15} className="text-[#0EA5E9]" />
                      </div>
                      Dubai, UAE — Singapore — India — USA — UK
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    Regional WhatsApp contacts
                  </h3>
                  <div className="flex flex-col gap-3">
                    {REGIONAL_CONTACTS.map(({ flag, country, phone, href }) => (
                      <a
                        key={country}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 bg-[#E0F2FE] rounded-lg flex items-center justify-center shrink-0">
                          <Phone size={13} className="text-[#0EA5E9]" />
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 mr-1.5">{flag}</span>
                          <span className="text-sm text-gray-700 group-hover:text-[#0EA5E9] transition-colors font-medium">
                            {country}
                          </span>
                          <span className="text-sm text-gray-400 ml-2">{phone}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}