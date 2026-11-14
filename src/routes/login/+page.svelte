<script lang="ts">
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let showPassword = $state(false);
</script>

<svelte:head>
  <title>Sign In — open3dFloorplan</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
  <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200/10 overflow-hidden">
    <div class="px-6 pt-8 pb-6 text-center border-b border-gray-100 dark:border-gray-700">
      <div class="mx-auto mb-3 w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">open3dFloorplan</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to access your projects</p>
    </div>

    <form method="POST" class="p-6 space-y-4">
      <input type="hidden" name="redirectTo" value={data.redirectTo} />

      {#if form?.error}
        <div role="alert" class="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {form.error}
        </div>
      {/if}

      {#if data.requireUsername}
        <label class="block">
          <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Username</span>
          <input
            type="text"
            name="username"
            required
            autocomplete="username"
            class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            placeholder="Enter username"
          />
        </label>
      {/if}

      <label class="block">
        <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</span>
        <div class="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            autocomplete="current-password"
            class="w-full px-3.5 py-2.5 pr-11 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            placeholder="Enter password"
          />
          <button
            type="button"
            onclick={() => (showPassword = !showPassword)}
            class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {#if showPassword}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"></path>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            {:else}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            {/if}
          </button>
        </div>
      </label>

      <button
        type="submit"
        class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-500/25 transition-colors cursor-pointer"
      >
        Sign In
      </button>
    </form>
  </div>
</div>

