'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { createErrorUrl } from '@/utils/error-handler'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const errorUrl = createErrorUrl('http://localhost:3000', {
      message: error.message,
      code: error.status,
      details: error.name
    })
    redirect(errorUrl)
  }

  revalidatePath('/', 'layout')
  redirect('/start')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    const errorUrl = createErrorUrl('http://localhost:3000', {
      message: error.message,
      code: error.status,
      details: error.name
    })
    redirect(errorUrl)
  }

  revalidatePath('/', 'layout')
  // Instead of redirect, throw a special error for the client to catch
  throw new Error('SIGNUP_CONFIRM_EMAIL')
}