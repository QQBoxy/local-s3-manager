<template>
  <div class="bg-white">
    <div class="relative isolate px-6 pt-14 lg:px-8">
      <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Local Upload</h1>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <div
              class="rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 cursor-pointer w-fit"
              @click="handleClick">
              Select File Directory
            </div>
          </div>
          <div class="mt-10" v-if="total > 0">
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${current / total * 100}%` }"></div>
            </div>
            <p class="mt-6 text-lg leading-8 text-gray-600">
              {{ current }} of {{ total }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const total = ref(0);
const current = ref(0);

const fileSelector = (): Promise<File[]> => {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute('webkitdirectory', 'webkitdirectory');
    input.setAttribute('multiple', 'multiple');
    input.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement;
      const fileList = target?.files || [];
      const files = Array.from(fileList);
      target.value = '';
      resolve(files);
    });
    input.click();
  });
};

const getPresignedUrl = async (file: File): Promise<string> => {
  const res = await axios.post('/api/presigned-upload', {
    keypath: file.webkitRelativePath,
  });
  return res.data.data.url;
};

const putObject = async (url: string, file: File): Promise<any> => {
  const res = await axios.put(url, file, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return res.data;
};

const handleClick = async () => {
  let files = await fileSelector();
  // Remove .DS_Store
  files = files.filter(file => !file.name.endsWith('.DS_Store'));
  total.value = files.length;
  for (let i = 0; i < files.length; i++) {
    console.log("files[i].name", files[i].name);
    const presignedUrl = await getPresignedUrl(files[i]);
    await putObject(presignedUrl, files[i]);
    current.value = i + 1;
  }
};

</script>

<style scoped></style>