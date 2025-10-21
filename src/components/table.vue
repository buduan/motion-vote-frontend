<template>
  <div class="w-full">
    <!-- 表格容器 -->
    <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      <table :class="tableClasses">
        <!-- 表头 -->
        <thead>
          <tr>
            <!-- 选择列 -->
            <th v-if="selectable" class="w-12">
              <label>
                <input
                  type="checkbox"
                  class="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @change="toggleSelectAll"
                />
              </label>
            </th>
            <!-- 动态列 -->
            <th
              v-for="column in columns"
              :key="column.key"
              :class="column.headerClass"
              :style="column.width ? { width: column.width } : {}"
            >
              {{ column.title }}
            </th>
            <!-- 操作列 -->
            <th v-if="hasActions" class="text-center">操作</th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody>
          <tr v-if="loading" class="hover">
            <td :colspan="totalColumns" class="text-center py-8">
              <span class="loading loading-spinner loading-md"></span>
              <span class="ml-2">加载中...</span>
            </td>
          </tr>

          <tr v-else-if="paginatedData.length === 0" class="hover">
            <td :colspan="totalColumns" class="text-center py-8 text-base-content/60">
              {{ emptyText }}
            </td>
          </tr>

          <tr
            v-for="(row, index) in paginatedData"
            v-else
            :key="getRowKey(row, index)"
            :class="getRowClass(row, index)"
            @click="handleRowClick(row, index)"
          >
            <!-- 选择列 -->
            <th v-if="selectable">
              <label>
                <input
                  type="checkbox"
                  class="checkbox"
                  :checked="selectedRows.includes(getRowKey(row, index))"
                  @change="toggleRowSelection(row, index)"
                  @click.stop
                />
              </label>
            </th>

            <!-- 数据列 -->
            <td v-for="column in columns" :key="column.key" :class="column.cellClass">
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :column="column"
                :index="index"
                :value="getColumnValue(row, column.key)"
              >
                {{ getColumnValue(row, column.key) }}
              </slot>
            </td>

            <!-- 操作列 -->
            <td v-if="hasActions" class="text-center">
              <slot name="actions" :row="row" :index="index">
                <div class="flex justify-center gap-2">
                  <button
                    v-for="action in actions"
                    :key="action.key"
                    :class="action.class || 'btn btn-ghost btn-xs'"
                    :disabled="action.disabled?.(row)"
                    @click.stop="action.handler(row, index)"
                  >
                    {{ action.label }}
                  </button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>

        <!-- 表尾 -->
        <tfoot v-if="showFooter">
          <tr>
            <th v-if="selectable"></th>
            <th v-for="column in columns" :key="column.key" :class="column.footerClass">
              <slot :name="`footer-${column.key}`" :column="column">
                {{ column.footerText || column.title }}
              </slot>
            </th>
            <th v-if="hasActions">操作</th>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- 分页组件 -->
    <div v-if="pagination && totalPages > 1" class="flex items-center justify-between mt-4">
      <!-- 分页信息 -->
      <div class="text-sm text-base-content/60">
        显示第 {{ startIndex + 1 }} - {{ endIndex }} 条，共 {{ total }} 条数据
      </div>

      <!-- 分页控件 -->
      <div class="join">
        <button class="join-item btn btn-sm" :disabled="computedCurrentPage === 1" @click="goToPage(1)">首页</button>
        <button
          class="join-item btn btn-sm"
          :disabled="computedCurrentPage === 1"
          @click="goToPage(computedCurrentPage - 1)"
        >
          上一页
        </button>

        <!-- 页码按钮 -->
        <button
          v-for="page in visiblePages"
          :key="page"
          class="join-item btn btn-sm"
          :class="{ 'btn-active': page === computedCurrentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          class="join-item btn btn-sm"
          :disabled="computedCurrentPage === totalPages"
          @click="goToPage(computedCurrentPage + 1)"
        >
          下一页
        </button>
        <button
          class="join-item btn btn-sm"
          :disabled="computedCurrentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          末页
        </button>
      </div>

      <!-- 每页条数选择 -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-base-content/60">每页</span>
        <select class="select select-sm select-bordered" :value="computedPageSize" @change="handlePageSizeChange">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
        <span class="text-sm text-base-content/60">条</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

// 类型定义
interface TableRow {
  [key: string]: unknown;
}

interface Column {
  key: string;
  title: string;
  width?: string;
  headerClass?: string;
  cellClass?: string;
  footerClass?: string;
  footerText?: string;
}

interface Action {
  key: string;
  label: string;
  handler: (row: TableRow, index: number) => void;
  class?: string;
  disabled?: (row: TableRow) => boolean;
}

interface Props {
  // 数据相关
  data?: TableRow[];
  columns?: Column[];
  loading?: boolean;
  emptyText?: string;

  // 表格样式
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  zebra?: boolean;
  pinRows?: boolean;
  pinCols?: boolean;
  showFooter?: boolean;

  // 选择功能
  selectable?: boolean;
  rowKey?: string | ((row: TableRow, index: number) => string | number);

  // 行样式和事件
  rowClass?: string | ((row: TableRow, index: number) => string);
  clickable?: boolean;

  // 操作按钮
  actions?: Action[];

  // 分页相关
  pagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  total?: number;
  pageSizeOptions?: number[];
  showQuickJumper?: boolean;
}

// Props 定义
const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  emptyText: '暂无数据',
  size: 'md',
  zebra: true,
  pinRows: false,
  pinCols: false,
  showFooter: false,
  selectable: false,
  rowKey: 'id',
  clickable: false,
  actions: () => [],
  pagination: true,
  pageSize: 10,
  currentPage: 1,
  pageSizeOptions: () => [10, 20, 50, 100],
});

// Emits 定义
const emit = defineEmits<{
  'update:currentPage': [page: number];
  'update:pageSize': [size: number];
  'update:selectedRows': [rows: TableRow[]];
  'row-click': [row: TableRow, index: number];
  'selection-change': [selectedRows: TableRow[]];
}>();

// 响应式数据
const selectedRows = ref<(string | number)[]>([]);
const internalCurrentPage = ref(props.currentPage);
const internalPageSize = ref(props.pageSize);

// 计算属性
const tableClasses = computed(() => {
  const classes = ['table'];
  if (props.size !== 'md') classes.push(`table-${props.size}`);
  if (props.zebra) classes.push('table-zebra');
  if (props.pinRows) classes.push('table-pin-rows');
  if (props.pinCols) classes.push('table-pin-cols');
  return classes.join(' ');
});

const hasActions = computed(() => props.actions.length > 0);

const totalColumns = computed(() => {
  let count = props.columns.length;
  if (props.selectable) count++;
  if (hasActions.value) count++;
  return count;
});

const total = computed(() => props.total || props.data.length);

const totalPages = computed(() => Math.ceil(total.value / internalPageSize.value));

const computedCurrentPage = computed({
  get: () => internalCurrentPage.value,
  set: value => {
    internalCurrentPage.value = value;
    emit('update:currentPage', value);
  },
});

const computedPageSize = computed({
  get: () => internalPageSize.value,
  set: value => {
    internalPageSize.value = value;
    emit('update:pageSize', value);
  },
});

const startIndex = computed(() => (computedCurrentPage.value - 1) * computedPageSize.value);
const endIndex = computed(() => Math.min(startIndex.value + computedPageSize.value, total.value));

const paginatedData = computed(() => {
  if (!props.pagination) return props.data;
  return props.data.slice(startIndex.value, startIndex.value + computedPageSize.value);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);

  let start = Math.max(1, computedCurrentPage.value - half);
  const end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const isAllSelected = computed(() => {
  if (paginatedData.value.length === 0) return false;
  return paginatedData.value.every((row, index) => selectedRows.value.includes(getRowKey(row, index)));
});

const isIndeterminate = computed(() => {
  const selectedCount = paginatedData.value.filter((row, index) =>
    selectedRows.value.includes(getRowKey(row, index)),
  ).length;
  return selectedCount > 0 && selectedCount < paginatedData.value.length;
});

// 方法
const getRowKey = (row: TableRow, index: number): string | number => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row, index);
  }
  return (row[props.rowKey as string] as string | number) ?? index;
};

const getRowClass = (row: TableRow, index: number): string => {
  let classes = 'hover';
  if (props.clickable) classes += ' cursor-pointer';

  if (typeof props.rowClass === 'function') {
    classes += ' ' + props.rowClass(row, index);
  } else if (props.rowClass) {
    classes += ' ' + props.rowClass;
  }

  return classes;
};

const getColumnValue = (row: TableRow, key: string): unknown => {
  return key.split('.').reduce((obj: unknown, k: string) => {
    if (obj && typeof obj === 'object' && k in obj) {
      return (obj as Record<string, unknown>)[k];
    }
    return undefined;
  }, row);
};

const handleRowClick = (row: TableRow, index: number) => {
  if (props.clickable) {
    emit('row-click', row, index);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消选择当前页所有行
    paginatedData.value.forEach((row, index) => {
      const key = getRowKey(row, index);
      const keyIndex = selectedRows.value.indexOf(key);
      if (keyIndex > -1) {
        selectedRows.value.splice(keyIndex, 1);
      }
    });
  } else {
    // 选择当前页所有行
    paginatedData.value.forEach((row, index) => {
      const key = getRowKey(row, index);
      if (!selectedRows.value.includes(key)) {
        selectedRows.value.push(key);
      }
    });
  }
  emitSelectionChange();
};

const toggleRowSelection = (row: TableRow, index: number) => {
  const key = getRowKey(row, index);
  const keyIndex = selectedRows.value.indexOf(key);

  if (keyIndex > -1) {
    selectedRows.value.splice(keyIndex, 1);
  } else {
    selectedRows.value.push(key);
  }

  emitSelectionChange();
};

const emitSelectionChange = () => {
  const selected = props.data.filter((row, index) => selectedRows.value.includes(getRowKey(row, index)));
  emit('selection-change', selected);
  emit('update:selectedRows', selected);
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    computedCurrentPage.value = page;
  }
};

const handlePageSizeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  computedPageSize.value = Number(target.value);
  computedCurrentPage.value = 1; // 重置到第一页
};

// 监听器
watch(
  () => props.currentPage,
  newPage => {
    internalCurrentPage.value = newPage;
  },
);

watch(
  () => props.pageSize,
  newSize => {
    internalPageSize.value = newSize;
  },
);
</script>

<style scoped>
.table th {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
