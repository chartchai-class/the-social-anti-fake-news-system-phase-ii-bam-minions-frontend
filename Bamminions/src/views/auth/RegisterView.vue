<script setup lang="ts">
import InputText from '@/components/InputText.vue'
import * as yup from 'yup'
import { useField, useForm } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/message'

const messageStore = useMessageStore()
const router = useRouter()
const validationSchema = yup.object({
  firstname: yup.string().required('The first name is required'),
  lastname: yup.string().required('The last name is required'),
  email: yup.string().required('The email is required'),
  password: yup.string().required('The password is required'),
})

const { errors, handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  },
})

const { value: firstname } = useField<string>('firstname')
const { value: lastname } = useField<string>('lastname')
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')
const onSubmit = handleSubmit((values) => {
  authStore
    .register(values.firstname, values.lastname, values.email, values.password)
    .then(() => {
      console.log('Registration successful')
      router.push({ name: 'login' })
    })
    .catch((err) => {
      messageStore.updateMessage('could not register')
      setTimeout(() => {
        messageStore.resetMessage()
      }, 3000)
      console.log('error', err)
    })
})
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <!-- https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600 -->
      <img
        class="mx-auto h-10 w-auto"
        src="https://preview.redd.it/random-question-but-does-anyone-have-versions-of-this-cat-v0-ya8qikz9kn0f1.png?width=640&crop=smart&auto=webp&s=2487b53aa5d4ac4e710f7717a6850c83562272ab"
        alt="Your Company"
      />
      <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Sign Up for your account
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="onSubmit">
        <!-- Email -->
        <div>
          <label for="firstname" class="block text-sm font-medium leading-6 text-gray-900">
            First Name
          </label>
          <InputText
            type="text"
            id="firstname"
            v-model="firstname"
            placeholder="First Name"
            :error="errors['firstname']"
          />
        </div>
        <div>
          <label for="lastname" class="block text-sm font-medium leading-6 text-gray-900">
            Last Name
          </label>
          <InputText
            type="text"
            id="lastname"
            v-model="lastname"
            placeholder="Last Name"
            :error="errors['lastname']"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium leading-6 text-gray-900">
            Email address
          </label>
          <InputText
            type="text"
            id="email"
            v-model="email"
            placeholder="Email address"
            :error="errors['email']"
          />
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div class="text-sm">
              <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </a>
            </div>
          </div>
          <InputText
            type="password"
            id="password"
            v-model="password"
            placeholder="Password"
            :error="errors['password']"
          />
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign Up
          </button>
        </div>
      </form>

      <!-- Register link -->
      <p class="mt-10 text-center text-sm text-gray-500">
        member?
        <a href="/login" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          Try to Login here
        </a>
      </p>
    </div>
  </div>
</template>
