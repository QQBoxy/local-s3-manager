<template>
  <div class="bg-white">
    <div class="relative isolate px-6 pt-14 lg:px-8">
      <div class="mx-auto max-w-2xl py-10">
        <div class="text-center">
          <div
            class="relative flex flex-col overflow-hidden text-gray-700 bg-white rounded-md shadow-md bg-clip-border">
            <nav class="my-2 flex min-w-[240px] flex-col gap-1 p-0 font-sans text-base font-normal text-blue-gray-700">
              <div v-if="files.length === 0 && directories.length === 0"
                class="flex w-full items-center rounded-none p-3 py-1.5 px-3 text-start text-sm font-normal text-blue-gray-700 outline-none transition-all">
                <RouterLink to="/">Please upload a file first.</RouterLink>
              </div>
              <div v-if="currentPrefix !== ''" role="button"
                class="flex w-full items-center rounded-none p-3 py-1.5 px-3 text-start text-sm font-normal text-blue-gray-700 outline-none transition-all hover:bg-blue-500 hover:bg-opacity-80 hover:text-white focus:bg-blue-500 focus:bg-opacity-80 focus:text-white active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                @click="getFiles(previousDirectory)">
                <div class="grid mr-4 place-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" stroke-width="1.5"
                    stroke="currentColor" class="w-4 h-4">
                    <path
                      d="M880 298.4H521L403.7 186.2a8.15 8.15 0 0 0-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32zM840 768H184V256h188.5l119.6 114.4H840V768z" />
                  </svg>
                </div>
                ..
              </div>
              <div v-for="directory in directories" :key="directory" role="button"
                class="group flex w-full items-center rounded-none p-3 py-1.5 px-3 text-start text-sm font-normal text-blue-gray-700 outline-none transition-all hover:bg-blue-500 hover:bg-opacity-80 hover:text-white focus:bg-blue-500 focus:bg-opacity-80 focus:text-white active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
                @click="getFiles(currentPrefix + directory)">
                <div class="grid mr-4 place-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" stroke-width="1.5"
                    stroke="currentColor" class="w-4 h-4">
                    <path
                      d="M880 298.4H521L403.7 186.2a8.15 8.15 0 0 0-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32zM840 768H184V256h188.5l119.6 114.4H840V768z" />
                  </svg>
                </div>
                {{ directory }}
                <div class="grid ml-auto place-items-center justify-self-end">
                  <div
                    class="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-gray-900 uppercase rounded-full select-none whitespace-nowrap bg-gray-900/10 group-hover:bg-white/20 group-hover:text-white"
                    @click.stop="removeFile(currentPrefix + directory)">
                    <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd"
                          d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                          clip-rule="evenodd"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div v-for="file in files" :key="file" role="button"
                class="group flex w-full items-center rounded-none p-3 py-1.5 px-3 text-start text-sm font-normal text-blue-gray-700 outline-none transition-all hover:bg-blue-500 hover:bg-opacity-80 hover:text-white focus:bg-blue-500 focus:bg-opacity-80 focus:text-white active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900">
                <div class="grid mr-4 place-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" stroke-width="1.5"
                    stroke="currentColor" class="w-4 h-4">
                    <path
                      d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0 0 42 42h216v494z" />
                  </svg>
                </div>
                {{ file }}
                <div class="grid ml-auto place-items-center justify-self-end">
                  <div
                    class="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-gray-900 uppercase rounded-full select-none whitespace-nowrap bg-gray-900/10 group-hover:bg-white/20 group-hover:text-white"
                    @click.stop="removeFile(currentPrefix + file)">
                    <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd"
                          d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                          clip-rule="evenodd"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </nav>
            <div v-if="loading" role="status"
              class="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
              <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor" />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill" />
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';

const loading = ref<boolean>(true);
const directories = ref<string[]>([]);
const files = ref<string[]>([]);
const previousDirectory = ref('');
const currentPrefix = ref<string>('');

const getFiles = async (prefix = '') => {
  loading.value = true;
  const res = await axios.get('/api/files', {
    params: {
      ...(prefix ? {
        prefix: prefix,
      } : {}),
    },
  });
  currentPrefix.value = prefix;
  directories.value = res.data.data.CommonPrefixes;
  files.value = res.data.data.Contents;
  previousDirectory.value = prefix.match(/^(.*?)[^/]+\/$/)?.[1] || '';
  loading.value = false;
};

const removeFile = async (prefix: string) => {
  loading.value = true;
  await axios.delete('/api/files', {
    params: {
      keypath: prefix,
    },
  });
  await getFiles(currentPrefix.value);
  loading.value = false;
};

onMounted(async () => {
  await getFiles();
});

</script>

<style scoped></style>