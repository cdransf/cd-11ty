import { createClient } from '@supabase/supabase-js';

const RATE_LIMIT = 5;
const TIME_FRAME = 60 * 60 * 1000;

const ipSubmissions = new Map();

export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || request.headers.get('Remote-Addr');
      const currentTime = Date.now();

      if (!ipSubmissions.has(ip)) {
        ipSubmissions.set(ip, []);
      }

      const submissions = ipSubmissions.get(ip).filter(time => currentTime - time < TIME_FRAME);

      if (submissions.length >= RATE_LIMIT) {
        return new Response('Rate limit exceeded', { status: 429 });
      }

      submissions.push(currentTime);
      ipSubmissions.set(ip, submissions);

      try {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');
        const hpName = formData.get('hp_name');

        // check the honeypot field
        if (hpName) return new Response('Spam detected', { status: 400 });

        // validate input
        if (!name || !email || !message) return new Response('Invalid input', { status: 400 });

        const supabaseUrl = env.SUPABASE_URL;
        const supabaseKey = env.SUPABASE_KEY;
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase.from('contacts').insert([
          { name, email, message, replied: false }
        ]);

        if (error) throw error;

        return Response.redirect('https://coryd.dev/contact/success', 303);
      } catch (error) {
        return new Response(error.message, { status: 500 });
      }
    } else {
      return new Response('Method not allowed', { status: 405 });
    }
  }
};