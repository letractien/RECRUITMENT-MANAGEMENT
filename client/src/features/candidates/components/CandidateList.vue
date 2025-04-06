<template>
  <div class="candidates-list">
    <h2>Candidates</h2>
    
    <!-- Filters -->
    <div class="filters">
      <el-input
        v-model="searchQuery"
        placeholder="Search candidates..."
        prefix-icon="el-icon-search"
        clearable
        @input="onSearch"
      />
      
      <el-select
        v-model="statusFilter"
        placeholder="Status"
        clearable
        @change="onFilterChange"
      >
        <el-option v-for="status in statusOptions" :key="status.value" :label="status.label" :value="status.value" />
      </el-select>
      
      <el-select
        v-model="departmentFilter"
        placeholder="Department"
        clearable
        @change="onFilterChange"
      >
        <el-option v-for="dept in departmentOptions" :key="dept" :label="dept" :value="dept" />
      </el-select>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <!-- Error state -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />
    
    <!-- Empty state -->
    <el-empty v-if="!loading && !candidates.length" description="No candidates found" />
    
    <!-- Candidates list -->
    <el-table
      v-if="!loading && candidates.length"
      :data="candidates"
      stripe
      style="width: 100%"
    >
      <el-table-column prop="name" label="Name" min-width="150" />
      <el-table-column prop="email" label="Email" min-width="200" />
      <el-table-column prop="position" label="Position" min-width="150" />
      <el-table-column prop="department" label="Department" min-width="150" />
      <el-table-column prop="experience" label="Experience" width="100">
        <template #default="scope">
          {{ scope.row.experience }} years
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="120">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="180">
        <template #default="scope">
          <el-button size="small" @click="viewCandidate(scope.row.id)">View</el-button>
          <el-button size="small" type="danger" @click="deleteCandidate(scope.row.id)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

export default {
  name: 'CandidateList',
  
  setup() {
    const store = useStore();
    const router = useRouter();
    
    // Data
    const searchQuery = ref('');
    const statusFilter = ref('');
    const departmentFilter = ref('');
    
    // Status options
    const statusOptions = [
      { value: 'new', label: 'New' },
      { value: 'screening', label: 'Screening' },
      { value: 'interview', label: 'Interview' },
      { value: 'offer', label: 'Offer' },
      { value: 'hired', label: 'Hired' },
      { value: 'rejected', label: 'Rejected' }
    ];
    
    // Department options (could be fetched from API)
    const departmentOptions = [
      'Engineering',
      'Product',
      'Marketing',
      'Sales',
      'Customer Support',
      'Human Resources',
      'Finance'
    ];
    
    // Computed properties
    const candidates = computed(() => store.getters['candidates/allCandidates']);
    const loading = computed(() => store.getters['candidates/isLoading']);
    const error = computed(() => store.getters['candidates/errorMessage']);
    
    // Methods
    const loadCandidates = () => {
      store.dispatch('candidates/fetchCandidates');
    };
    
    const onSearch = () => {
      store.dispatch('candidates/setFilters', { search: searchQuery.value });
    };
    
    const onFilterChange = () => {
      store.dispatch('candidates/setFilters', {
        status: statusFilter.value,
        department: departmentFilter.value
      });
    };
    
    const viewCandidate = (id) => {
      router.push(`/candidates/${id}`);
    };
    
    const deleteCandidate = async (id) => {
      try {
        await ElMessageBox.confirm(
          'This will permanently delete the candidate. Continue?',
          'Warning',
          {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        );
        
        await store.dispatch('candidates/deleteCandidate', id);
      } catch (e) {
        // User canceled or there was an error
        console.log('Delete canceled or failed:', e);
      }
    };
    
    const getStatusType = (status) => {
      const statusMap = {
        new: 'info',
        screening: 'info',
        interview: 'warning',
        offer: 'success',
        hired: 'success',
        rejected: 'danger'
      };
      
      return statusMap[status] || 'info';
    };
    
    // Lifecycle hooks
    onMounted(() => {
      loadCandidates();
    });
    
    return {
      // Data
      searchQuery,
      statusFilter,
      departmentFilter,
      statusOptions,
      departmentOptions,
      
      // Computed
      candidates,
      loading,
      error,
      
      // Methods
      onSearch,
      onFilterChange,
      viewCandidate,
      deleteCandidate,
      getStatusType
    };
  }
};
</script>

<style scoped>
.candidates-list {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.loading-container {
  width: 100%;
  padding: 20px 0;
}
</style> 