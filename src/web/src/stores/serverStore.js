import { defineStore } from "pinia";

export const useServerStore = defineStore('server', {
    state: () => ({
        current: null,
    }),
    actions: {
        setCurrentServer(server){
            this.current = server
        },
        clearCurrentServer(){
            this.current = null;
        }
    }
})