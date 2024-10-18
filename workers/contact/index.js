import { createClient } from '@supabase/supabase-js'

const RATE_LIMIT = 5
const TIME_FRAME = 60 * 60 * 1000
const ipSubmissions = new Map()

export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || request.headers.get('Remote-Addr')
      const currentTime = Date.now()

      if (!ipSubmissions.has(ip)) ipSubmissions.set(ip, [])

      const submissions = ipSubmissions.get(ip).filter(time => currentTime - time < TIME_FRAME)

      if (submissions.length >= RATE_LIMIT) return Response.redirect('https://coryd.dev/rate-limit', 301)

      submissions.push(currentTime)
      ipSubmissions.set(ip, submissions)

      try {
        const formData = await request.formData()
        const name = formData.get('name')
        const email = formData.get('email')
        const message = formData.get('message')
        const hpName = formData.get('hp_name')
        if (hpName) return new Response('Spam detected', { status: 400 })
        if (!name || !email || !message) return new Response('Invalid input', { status: 400 })

        const emailDomain = email.split('@')[1].toLowerCase()
        const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL
        const supabaseKey = env.SUPABASE_KEY || process.env.SUPABASE_KEY
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data: blockedDomains, error: domainError } = await supabase
          .from('blocked_domains')
          .select('domain_name')

        if (domainError) throw new Error(`Failed to fetch blocked domains: ${domainError.message}`)

        const domainList = blockedDomains.map(item => item['domain_name'].toLowerCase())

        if (domainList.includes(emailDomain)) return new Response('Email domain is blocked.', { status: 400 })

        const { error } = await supabase.from('contacts').insert([
          { name, email, message, replied: false }
        ])

        if (error) throw error

        const forwardEmailApiKey = env.FORWARDEMAIL_API_KEY
        const authHeader = 'Basic ' + btoa(`${forwardEmailApiKey}:`)
        const emailData = new URLSearchParams({
          from: `${name} <hi@admin.coryd.dev>`,
          to: 'hi@coryd.dev',
          subject: `${message}`,
          text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
          replyTo: email
        }).toString()
        const response = await fetch('https://api.forwardemail.net/v1/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authHeader
          },
          body: emailData
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Email API response error:', response.status, errorText)
          throw new Error(`Failed to send email: ${errorText}`)
        }

        return Response.redirect('https://coryd.dev/contact/success', 301)
      } catch (error) {
        console.error('Error:', error.message)
        return Response.redirect('https://coryd.dev/broken', 301)
      }
    } else {
      return Response.redirect('https://coryd.dev/not-allowed', 301)
    }
  }
}