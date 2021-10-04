<template>
  <!-- This example requires Tailwind CSS v2.0+ -->
  <nav class="bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
<!--
          <div class="flex-shrink-0 rounded-md border-2 border-purple-900 px-3 py-2">
            V-M
          </div>
-->
          <div class="hidden sm:block sm:ml-6">
            <div class="flex space-x-4">
              <a v-for="p in pages"
                 :key="p.url"
                 :href="p.url"
                 class="px-3 py-2 rounded-md text-sm font-medium"
                 :class="{
                   'bg-gray-900': p.isCurrent,
                   'text-white': p.isCurrent,
                   'text-gray-300': ! p.isCurrent,
                   'hover:bg-gray-700': ! p.isCurrent,
                   'hover:text-white': ! p.isCurrent
                 }">
               {{ p.label }}
              </a>
            </div>
          </div>
        </div>
        <div class="-mr-2 flex sm:hidden">
          <!-- Mobile menu button -->
          <button type="button" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false" @click="toggle_mobile_menu()">
            <span class="sr-only">Open main menu</span>
            <!--
              Icon when menu is closed.
  
              Heroicon name: outline/menu
  
              Menu open: "hidden", Menu closed: "block"
            -->
            <svg class="block h-6 w-6" 
                 :class="{'block': ! mobile_menu_open, 'hidden': mobile_menu_open}"
                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <!--
              Icon when menu is open.

              Heroicon name: outline/x
  
              Menu open: "block", Menu closed: "hidden"
            -->
            <svg class="h-6 w-6" 
                 :class="{'block': mobile_menu_open, 'hidden': ! mobile_menu_open}"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu, show/hide based on menu state. -->
    <div :class="{'sm:hidden': mobile_menu_open, 'hidden': ! mobile_menu_open }" 
         id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <a v-for="p in pages"
           :key="p.url"
           :href="p.url"
           class="block px-3 py-2 rounded-md text-base font-medium"
           :class="{
             'bg-gray-900': p.isCurrent,
             'text-white': p.isCurrent,
             'text-gray-300': ! p.isCurrent,
             'hover:by-gray-700': ! p.isCurrent,
             'hover:text-white': ! p.isCurrent
            }">
            {{ p.label }}
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navbar",
  data: function() {
    return {
      pages: [
        {label: "Home", url: "/index.html", isCurrent: false, isDefault: true},
        {label: "Demo", url: "/demo.html", isCurrent: false, isDefault: false},
        {label: "Video bombing", url: "/insertme.html", isCurrent: false, isDefault: false},
        {label: "Action transposing", url: "/actionathome.html", isCurrent: false, isDefault: false},
      ],
      mobile_menu_open: false
    };
  },
  mounted: function() {
    var u = new URL(window.location);
    this.pages.forEach((p) => {p.isCurrent = (u.pathname.includes(p.url.replace(/\.html$/i, "")));});
    if (! this.pages.reduce((acc, p) => {return acc || p.isCurrent;}, false)) {
      var p = this.pages.find((p) => p.isDefault);
      if (p !== undefined) {p.isCurrent = true;}
    }
  },
  methods: {
    toggle_mobile_menu: function() {this.mobile_menu_open = ! this.mobile_menu_open;}
  }
};
</script>
