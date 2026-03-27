<template>
    <div class="bg-base-100 navbar flex justify-between shadow">
        <a class="btn btn-ghost text-xl ml-1" href="/">NGSP</a>

        <ul class="menu menu-horizontal gap-2">
            <li>
                <RouterLink to="/" exactActiveClass="menu-active">首页</RouterLink>
            </li>
            <li>
                <RouterLink to="/servers" exactActiveClass="menu-active">服务器列表</RouterLink>
            </li>
            <li>
                <label class="swap swap-rotate">
                    <!-- this hidden checkbox controls the state -->
                    <input type="checkbox" class="theme-controller" value="dark" />

                    <!-- sun icon -->
                    <svg class="swap-off h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2">
                            <circle cx="12" cy="12" r="4" />
                            <path
                                d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </g>
                    </svg>

                    <!-- moon icon -->
                    <svg class="swap-on h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2"
                            d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
                    </svg>
                </label>
            </li>
        </ul>
    </div>
</template>