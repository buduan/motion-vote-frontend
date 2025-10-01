<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWindowScroll } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { Menu, X, CheckCircle, Zap, Building, Github, Mail, Users, Settings } from 'lucide-vue-next';

// 使用 VueUse 的 useWindowScroll 获取滚动位置
const { y } = useWindowScroll();
const router = useRouter();

// 判断页面是否在最顶部
const isTop = computed(() => y.value <= 0);

// Drawer 控制状态
const isDrawerOpen = ref(false);

// 导航功能
const navigateToAudience = () => {
  router.push('/audience');
  isDrawerOpen.value = false; // 导航后关闭drawer
};

const navigateToAdmin = () => {
  router.push('/admin');
  isDrawerOpen.value = false;
};

const contactUs = () => {
  window.location.href = 'mailto:computerpsychounion@nottingham.edu.cn';
  isDrawerOpen.value = false;
};

const openGitHub = () => {
  window.open('https://github.com/CompPsyUnion/motion-vote', '_blank');
  isDrawerOpen.value = false;
};

// 锚点导航
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
  isDrawerOpen.value = false;
};

// 功能特性数据 - 基于API文档更新
const features = [
  {
    icon: '🗳️',
    title: 'Real-time Voting System',
    description:
      'Support real-time voting interaction for debate events with instant vote switching and result locking.',
  },
  {
    icon: '📊',
    title: 'Live Screen Display',
    description: 'Real-time data display on big screens with theme control and live updates via WebSocket.',
  },
  {
    icon: '🎯',
    title: 'Activity Management',
    description: 'Create activities, manage collaborators, and control participant access efficiently.',
  },
  {
    icon: '📱',
    title: 'Multi-device Access',
    description: 'Participants can join via activity ID and number, accessible on any device.',
  },
  {
    icon: '🔒',
    title: 'Secure Authentication',
    description: 'JWT Token authentication for organizers and secure participant verification system.',
  },
  {
    icon: '📈',
    title: 'Data Analytics',
    description: 'Real-time dashboard, activity reports, and comprehensive data export capabilities.',
  },
];

// 使用案例数据 - 基于辩论投票系统更新
const useCases = [
  {
    title: 'Debate Competitions',
    description: 'Perfect for debate tournaments with real-time audience voting and live result displays.',
    image: '🎤',
  },
  {
    title: 'Academic Events',
    description: 'Enhance academic discussions and conferences with interactive audience participation.',
    image: '🎓',
  },
  {
    title: 'Corporate Decisions',
    description: 'Make team decisions more democratic with structured voting and result tracking.',
    image: '🏢',
  },
];
</script>

<template>
  <div class="drawer">
    <!-- Drawer Toggle Input -->
    <input id="mobile-drawer" v-model="isDrawerOpen" type="checkbox" class="drawer-toggle" />

    <!-- Main Content -->
    <div class="drawer-content min-h-screen bg-base-100">
      <!-- Navigation Bar -->
      <div class="w-full flex justify-center">
        <div
          class="fixed navbar bg-base-100/60 backdrop-blur-lg border-base-200 z-10 transition-all duration-500"
          :class="{
            'w-full border-b-1 left-0 px-8': !isTop,
            'w-11/12 border-1 top-4 transform px-4': isTop,
          }"
          :style="{
            borderRadius: isTop ? '25rem' : '0',
          }"
        >
          <div class="flex-1">
            <a class="btn btn-ghost text-xl font-bold">Motion Vote</a>
          </div>

          <!-- Desktop Navigation -->
          <div class="flex-none hidden lg:flex">
            <ul class="menu menu-horizontal px-1">
              <li><a @click="scrollToSection('features')">Features</a></li>
              <li><a @click="scrollToSection('how-it-works')">How It Works</a></li>
              <li><a @click="contactUs">Contact</a></li>
              <li>
                <button class="btn btn-ghost btn-sm" @click="openGitHub">
                  <Github class="w-5 h-5" />
                  GitHub
                </button>
              </li>
              <li>
                <button class="btn btn-primary btn-sm ml-2" @click="navigateToAdmin">Control</button>
              </li>
            </ul>
          </div>

          <!-- Mobile Hamburger Menu -->
          <div class="flex-none lg:hidden">
            <label for="mobile-drawer" class="btn btn-square btn-ghost drawer-button">
              <Menu class="w-6 h-6" />
            </label>
          </div>
        </div>
      </div>

      <!-- Hero Section -->
      <section class="hero min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
        <div class="hero-content text-center max-w-6xl">
          <div class="max-w-4xl">
            <h1
              class="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              Motion Vote
            </h1>
            <p class="text-xl md:text-2xl mb-4 text-base-content/80">Real-time Interactive Debate Voting System</p>
            <p class="text-lg mb-8 text-base-content/70 max-w-3xl mx-auto">
              Transform your debates and discussions with our comprehensive voting platform. Engage audiences, track
              opinions, and display results in real-time with professional-grade tools.
            </p>

            <!-- Open Source Project Notice -->
            <div class="alert alert-info mb-8 max-w-2xl mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>This is an open-source project. We welcome contributions from the community!</span>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button class="btn btn-primary btn-lg" @click="navigateToAudience">
                <Users />
                Join as Audience
              </button>
              <button class="btn btn-outline btn-lg" @click="openGitHub">
                <Github class="w-5 h-5" />
                GitHub
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-20 bg-base-200/50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-6">Powerful Features</h2>
            <p class="text-xl text-base-content/70 max-w-3xl mx-auto">
              Everything you need to create engaging, interactive voting experiences
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div class="card-body text-center">
                <div class="text-4xl mb-4">{{ feature.icon }}</div>
                <h3 class="card-title justify-center text-xl mb-3">{{ feature.title }}</h3>
                <p class="text-base-content/70">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section id="how-it-works" class="py-20">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p class="text-xl text-base-content/70 max-w-3xl mx-auto">Get started in three simple steps</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div
                class="w-20 h-20 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6"
              >
                1
              </div>
              <h3 class="text-2xl font-bold mb-4">Create Your Debate</h3>
              <p class="text-base-content/70">
                Set up your debate topic, configure voting options, and invite participants to join the discussion.
              </p>
            </div>

            <div class="text-center">
              <div
                class="w-20 h-20 bg-secondary text-secondary-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6"
              >
                2
              </div>
              <h3 class="text-2xl font-bold mb-4">Engage Participants</h3>
              <p class="text-base-content/70">
                Participants join using activity ID and number, vote in real-time, and can change their votes during the
                session.
              </p>
            </div>

            <div class="text-center">
              <div
                class="w-20 h-20 bg-accent text-accent-content rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6"
              >
                3
              </div>
              <h3 class="text-2xl font-bold mb-4">Display Results</h3>
              <p class="text-base-content/70">
                Monitor live results on the big screen with real-time updates and comprehensive analytics dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Use Cases Section -->
      <section id="use-cases" class="py-20 bg-base-200/50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold mb-6">Perfect For Any Setting</h2>
            <p class="text-xl text-base-content/70 max-w-3xl mx-auto">
              Motion Vote adapts to your needs, whether you're in a boardroom, classroom, or conference hall
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              v-for="useCase in useCases"
              :key="useCase.title"
              class="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div class="card-body text-center">
                <div class="text-6xl mb-6">{{ useCase.image }}</div>
                <h3 class="card-title justify-center text-xl mb-4">{{ useCase.title }}</h3>
                <p class="text-base-content/70">{{ useCase.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 bg-gradient-to-r from-primary to-secondary">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of organizations using Motion Vote to make their meetings more engaging and democratic.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button class="btn btn-neutral btn-lg px-8" @click="navigateToAdmin">Start Creating</button>
            <button
              class="btn btn-outline btn-lg px-8 text-white border-white hover:bg-white hover:text-primary"
              @click="navigateToAudience"
            >
              Join a Vote
            </button>
          </div>
        </div>
      </section>

      <!-- Footer with DaisyUI Footer with Logo Section -->
      <footer class="footer md:footer-horizontal footer-vertical p-10 bg-neutral text-neutral-content">
        <aside>
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill-rule="evenodd"
            clip-rule="evenodd"
            class="fill-current"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <div>
            <p class="font-bold text-xl">Motion Vote</p>
            <p>Open-source real-time voting system for debate events</p>
            <p>Made with ♥️ by CPU</p>
          </div>
        </aside>
        <nav>
          <header class="footer-title">Services</header>
          <a class="link link-hover">Real-time Voting</a>
          <a class="link link-hover">Activity Management</a>
          <a class="link link-hover">Live Screen Display</a>
          <a class="link link-hover">Data Analytics</a>
        </nav>
        <nav>
          <header class="footer-title">Community</header>
          <a class="link link-over cursor-pointer" @click="openGitHub">GitHub Repository</a>
          <a class="link link-hover">Documentation</a>
          <a class="link link-hover" href="https://github.com/CompPsyUnion/motion-vote/contribute">Contribute</a>
          <a class="link link-hover" href="https://github.com/CompPsyUnion/motion-vote/issues">Report Issues</a>
        </nav>
        <nav>
          <header class="footer-title">Legal</header>
          <a class="link link-hover">Privacy Policy</a>
          <a class="link link-hover">Terms of Service</a>
          <a class="link link-over cursor-pointer" @click="contactUs">Contact</a>
        </nav>
      </footer>

      <!-- Copyright Section -->
      <footer class="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
          <p>© 2025 Computer Psycho Union,UNNC - Open Source Project. Apache-2.0 license.</p>
        </div>
      </footer>
    </div>

    <!-- Mobile Drawer Sidebar -->
    <div class="drawer-side z-50">
      <label for="mobile-drawer" class="drawer-overlay"></label>
      <aside class="min-h-full w-80 bg-base-200 text-base-content">
        <!-- Drawer Header -->
        <div class="flex items-center justify-between p-4 border-b border-base-300">
          <h2 class="text-xl font-bold">Motion Vote</h2>
          <label for="mobile-drawer" class="btn btn-sm btn-circle btn-ghost">
            <X class="w-6 h-6" />
          </label>
        </div>

        <!-- Navigation Menu -->
        <ul class="menu p-4 space-y-2">
          <!-- Navigation Links -->
          <li>
            <a
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
              @click="scrollToSection('features')"
            >
              <CheckCircle class="w-5 h-5" />
              <span>Features</span>
            </a>
          </li>
          <li>
            <a
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
              @click="scrollToSection('how-it-works')"
            >
              <Zap class="w-5 h-5" />
              <span>How It Works</span>
            </a>
          </li>
          <li>
            <a
              class="flex items-center space-x-3 p-3 rounded-lg hover:bg-base-300 transition-colors"
              @click="scrollToSection('use-cases')"
            >
              <Building class="w-5 h-5" />
              <span>Use Cases</span>
            </a>
          </li>

          <!-- Divider -->
          <div class="divider"></div>

          <!-- Action Buttons -->
          <li>
            <button class="btn btn-primary w-full justify-start" @click="navigateToAudience">
              <Users class="w-5 h-5 mr-2" />
              Join as Audience
            </button>
          </li>
          <li>
            <button class="btn btn-secondary w-full justify-start" @click="navigateToAdmin">
              <Settings class="w-5 h-5 mr-2" />
              Control Panel
            </button>
          </li>

          <!-- Divider -->
          <div class="divider"></div>

          <!-- External Links -->
          <li>
            <button class="btn btn-ghost w-full justify-start" @click="openGitHub">
              <Github class="w-5 h-5 mr-2" />
              GitHub Repository
            </button>
          </li>
          <li>
            <button class="btn btn-ghost w-full justify-start" @click="contactUs">
              <Mail class="w-5 h-5 mr-2" />
              Contact Us
            </button>
          </li>
        </ul>

        <!-- Footer in Drawer -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-base-300 bg-base-200">
          <p class="text-sm text-base-content/70 text-center">© 2025 Computer Psycho Union,UNNC</p>
          <p class="text-xs text-base-content/50 text-center mt-1">Open Source Project</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}

/* Custom gradient text animation */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}
</style>
