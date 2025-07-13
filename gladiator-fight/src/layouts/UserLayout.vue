<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const router = useRouter();

const login = () => {
    router.push({ name: 'login' });
};

const logout = async () => {
    router.push({ name: 'login' }); // ไปหน้า login เสมอหลัง logout
};

const displayName = computed(() => {
    return 'ผู้ใช้';
});
const pictureUrl = computed(() => {
    return '/favicon.ico';
});

// TODO: Replace with real authentication logic
const isLoggedIn = computed(() => false);
</script>

<template>
    <div class="min-h-screen bg-base-200">
        <!-- Mobile-optimized navbar -->
        <div class="navbar bg-base-100 shadow-sm px-2 sm:px-4">
            <div class="navbar-start">
                <div class="dropdown">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle btn-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </div>
                    <ul tabindex="0"
                        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-44 sm:w-52 p-2 shadow-lg border">
                        <li>
                            <RouterLink :to="{ name: 'home' }" class="text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4" />
                                </svg>
                                หน้าหลัก
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{ name: 'fight' }" class="text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2" />
                                </svg>
                                เข้าสู่สนามประลอง
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{ name: 'history' }" class="text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ประวัติการเล่น
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{ name: 'townhall' }" class="text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M9 21V7h6v14" />
                                </svg>
                                ศาลากลางเมือง
                            </RouterLink>
                        </li>
                        <li>
                            <RouterLink :to="{ name: 'profile' }" class="text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                ข้อมูลส่วนตัว
                            </RouterLink>
                        </li>
                        <li>
                            <button @click="logout" class="text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                ออกจากระบบ
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Compact logo for mobile -->
            <RouterLink :to="{ name: 'home' }" class="navbar-center">
                <span class="btn btn-ghost text-lg sm:text-xl font-bold text-primary">TokBut</span>
            </RouterLink>

            <div class="navbar-end">
                <button @click="login" v-if="!isLoggedIn" class="btn btn-ghost btn-sm">
                    Login
                </button>
                <div v-else class="dropdown dropdown-end dropdown-bottom">
                    <div tabindex="0" role="button" class="flex items-center gap-1 sm:gap-2 btn btn-ghost btn-sm px-1 sm:px-2">
                        <span class="font-semibold text-primary text-xs sm:text-sm max-w-20 sm:max-w-none truncate">{{ displayName }}</span>
                        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0">
                            <img :src="pictureUrl || '/favicon.ico'" 
                                 alt="Avatar" 
                                 class="w-full h-full object-cover"
                                 @error="(e) => { (e.target as HTMLImageElement).src = '/favicon.ico' }" />
                        </div>
                    </div>
                    <ul tabindex="0"
                        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-44 sm:w-52 p-2 shadow-lg border">
                        <li>
                            <RouterLink :to="{ name: 'profile' }" class="text-sm justify-between">
                                <span class="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    ข้อมูลส่วนตัว
                                </span>
                            </RouterLink>
                        </li>
                        <li>
                            <button @click="logout" class="text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                ออกจากระบบ
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Main content with mobile padding -->
        <main class="px-2 sm:px-4 py-2 sm:py-4">
            <slot></slot>
        </main>
    </div>
</template>