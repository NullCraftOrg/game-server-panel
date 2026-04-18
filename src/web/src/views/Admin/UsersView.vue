<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import MainTitle from '@/components/MainTitle.vue'
import type { UserType } from '@/types/UserType'
import { userApi } from '@/api/index'
import ConfirmDialog from '@/components/Dialog/ConfirmDialog.vue'

// 用户表
const users = ref<UserType[]>([])

// 根据用户角色返回对应的 badge 样式
const roleBadge = computed(() => {
    return (role: string) => {
        switch (role) {
            case 'admin':
                return 'badge-neutral'
            case 'user':
                return 'badge-info'
            default:
                return 'badge-ghost'
        }
    }
})

// 请求用户列表
async function fetchUsers() {
    users.value = await userApi.getUsers()
}

// 被选择删除的用户信息
const selectDeleteUser = ref<UserType>()
// 删除对话框ref
const deleteUserDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)
// 打开删除用户
const openDeleteUserDialog = (user: UserType) => {
    if (!user) return
    selectDeleteUser.value = user

    const uid = Number(user.id)
    if (isNaN(uid) || !deleteUserDialogRef) return
    deleteUserDialogRef.value?.open(uid)
}
// 删除用户
const deleteUserHandle = async (uid: number) => {
    if (!isNaN(uid)) {
        console.log(uid, '删除')
        await userApi.deleteUser(uid)
        fetchUsers()
    }
}

onMounted(async () => {
    fetchUsers()
})
</script>

<template>
    <MainTitle>
        <div class="flex justify-between mb-3">
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                        stroke-width="2">
                        <path
                            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87" />
                        <circle cx="9" cy="7" r="4" />
                    </g>
                </svg>
                <h3 class="text-xl font-bold">用户管理</h3>
            </div>
        </div>
    </MainTitle>

    <div class="overflow-x-auto bg-base-100 rounded-box shadow-md">
        <p class="p-4 pb-2 text-xs text-base-content/50">用户列表</p>
        <table class="table">
            <!-- 表头 -->
            <thead>
                <tr>
                    <th>
                        <label>
                            <input type="checkbox" class="checkbox" />
                        </label>
                    </th>
                    <th>UID</th>
                    <th>用户信息</th>
                    <th>角色</th>
                    <th>操作</th>
                </tr>
            </thead>

            <tr class="hover:bg-base-300" v-for="user in users" :key="user.id">
                <th>
                    <label>
                        <input type="checkbox" class="checkbox" />
                    </label>
                </th>
                <td>
                    {{ user.id }}
                </td>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="avatar avatar-placeholder">
                            <div class="bg-neutral text-neutral-content size-10 mask mask-squircle">
                                <span class="text-xl font-bold uppercase">{{ user.username.charAt(0) }}</span>
                            </div>
                        </div>
                        <div>
                            <div class="font-bold">{{ user.username }}</div>
                            <div class="text-sm text-base-content/50">{{ user.email }}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge badge-sm" :class="roleBadge(user.role)">@{{ user.role }}</span>
                </td>
                <th class="flex gap-2">
                    <button class="btn btn-square btn-ghost">
                        <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2">
                                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path
                                    d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
                            </g>
                        </svg>
                    </button>

                    <button class="btn btn-error btn-square btn-ghost" @click="openDeleteUserDialog(user)">
                        <svg class="size-[1.2em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </th>
            </tr>

        </table>

    </div>

    <ConfirmDialog ref="deleteUserDialogRef" title="确定删除用户?" @confirm="deleteUserHandle">
        <template v-slot:content>
            <p class="py-4">
                这将完全将用户 <strong class="text-error">{{ selectDeleteUser?.username }}</strong> 在数据库中删除，无法恢复！
            </p>
        </template>
    </ConfirmDialog>
</template>