<template>
  <div class="job-creation-form">
    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Basic Job Information -->
      <div class="form-section">
        <div class="section-header">
          <h3 class="text-lg font-semibold">Job Information</h3>
          <p class="text-sm text-gray-500">Please fill in the following information to create a new job</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="form-group">
            <label class="form-label">Job Title</label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Department</label>
            <input
              v-model="form.department"
              type="text"
              class="form-input"
              placeholder="e.g. Engineering"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input
              v-model="form.location"
              type="text"
              class="form-input"
              placeholder="e.g. Ho Chi Minh City"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Salary Range (VND)</label>
            <div class="flex gap-2">
              <input
                v-model="form.min_salary"
                type="number"
                placeholder="Min"
                class="form-input"
                style="width: calc(50% - 4px);"
                required
              />
              <input
                v-model="form.max_salary"
                type="number"
                placeholder="Max"
                class="form-input"
                style="width: calc(50% - 4px);"
                required
              />
            </div>
          </div>
        </div>
        <div class="mt-6">
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="form.description"
              rows="4"
              class="form-input"
              placeholder="Describe the job responsibilities and requirements..."
              required
            ></textarea>
          </div>
          <div class="form-group mt-4">
            <label class="form-label">Requirements</label>
            <textarea
              v-model="form.requirements"
              rows="4"
              class="form-input"
              placeholder="List the specific requirements for this position..."
              required
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Evaluation Criteria Sections -->
      <div class="space-y-8">
        <!-- Background Evaluation -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Background Evaluation Criteria</h3>
            <p class="text-sm text-gray-500">Evaluate candidates based on their educational background and personal information</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="form-label">Importance Ratio (%)</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.background_criteria.importance_ratio"
                  type="number"
                  min="0"
                  max="100"
                  class="form-input w-32"
                  required
                />
                <div class="flex-1">
                  <div class="h-2 bg-gray-200 rounded-full">
                    <div
                      class="h-full bg-blue-500 rounded-full"
                      :style="{ width: `${Math.min(form.background_criteria.importance_ratio, 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label"></label>
              <textarea
                v-model="form.background_criteria.required"
                rows="3"
                class="form-input"
                placeholder="Enter the required criteria for this position..."
              ></textarea>
            </div>
          </div>
          <div class="mt-6">
            <div class="form-group">
              <label class="form-label">Evaluation Criteria</label>
              <div class="space-y-3">
                <div v-for="(criterion, index) in form.background_criteria.criteria" :key="index" class="criterion-row">
                  <div class="criterion-inputs">
                    <input
                      v-model="criterion.description"
                      type="text"
                      placeholder="Criterion description"
                      class="form-input"
                      required
                    />
                    <input
                      v-model="criterion.max_score"
                      type="number"
                      placeholder="MScore"
                      class="form-input w-32"
                      required
                    />
                    <button
                      type="button"
                      @click="removeCriterion('background', index)"
                      class="btn-remove"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  @click="addCriterion('background')"
                  class="btn-add w-full"
                >
                  <div class="btn-add-content">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span>Add Criterion</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Project Evaluation -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Project Evaluation Criteria</h3>
            <p class="text-sm text-gray-500">Evaluate candidates based on their project experience</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="form-label">Importance Ratio (%)</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.project_criteria.importance_ratio"
                  type="number"
                  min="0"
                  max="100"
                  class="form-input w-32"
                  required
                />
                <div class="flex-1">
                  <div class="h-2 bg-gray-200 rounded-full">
                    <div
                      class="h-full bg-blue-500 rounded-full"
                      :style="{ width: `${Math.min(form.project_criteria.importance_ratio, 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label"></label>
              <textarea
                v-model="form.project_criteria.required"
                rows="3"
                class="form-input"
                placeholder="Enter the required criteria for this position..."
              ></textarea>
            </div>
          </div>
          <div class="mt-6">
            <div class="form-group">
              <label class="form-label">Evaluation Criteria</label>
              <div class="space-y-3">
                <div v-for="(criterion, index) in form.project_criteria.criteria" :key="index" class="criterion-row">
                  <div class="criterion-inputs">
                    <input
                      v-model="criterion.description"
                      type="text"
                      placeholder="Criterion description"
                      class="form-input"
                    />
                    <input
                      v-model="criterion.max_score"
                      type="number"
                      placeholder="MScore"
                      class="form-input w-32"
                    />
                    <button
                      type="button"
                      @click="removeCriterion('project', index)"
                      class="btn-remove"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  @click="addCriterion('project')"
                  class="btn-add w-full"
                >
                  <div class="btn-add-content">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span>Add Criterion</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Skill Evaluation -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Skill Evaluation Criteria</h3>
            <p class="text-sm text-gray-500">Evaluate candidates based on their technical and soft skills</p>
          </div>
          <div class="space-y-6">
            <div class="form-group">
              <label class="form-label">Importance Ratio (%)</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.skill_criteria.importance_ratio"
                  type="number"
                  min="0"
                  max="100"
                  class="form-input w-32"
                  required
                />
                <div class="flex-1">
                  <div class="h-2 bg-gray-200 rounded-full">
                    <div
                      class="h-full bg-blue-500 rounded-full"
                      :style="{ width: `${Math.min(form.skill_criteria.importance_ratio, 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label"></label>
              <textarea
                v-model="form.skill_criteria.required"
                rows="3"
                class="form-input"
                placeholder="Enter the required criteria for this position..."
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Evaluation Criteria</label>
              <div class="space-y-3">
                <div v-for="(criterion, index) in form.skill_criteria.criteria" :key="index" class="criterion-row">
                  <div class="criterion-inputs">
                    <input
                      v-model="criterion.description"
                      type="text"
                      placeholder="Criterion description"
                      class="form-input"
                    />
                    <input
                      v-model="criterion.max_score"
                      type="number"
                      placeholder="MScore"
                      class="form-input w-32"
                    />
                    <button
                      type="button"
                      @click="removeCriterion('skill', index)"
                      class="btn-remove"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  @click="addCriterion('skill')"
                  class="btn-add w-full"
                >
                  <div class="btn-add-content">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    <span>Add Criterion</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Certification Evaluation -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="text-lg font-semibold">Certification Evaluation Criteria</h3>
            <p class="text-sm text-gray-500">Evaluate candidates based on their certifications and qualifications</p>
          </div>
          <div class="space-y-6">
            <div class="form-group">
              <label class="form-label">Importance Ratio (%)</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.certification_criteria.importance_ratio"
                  type="number"
                  min="0"
                  max="100"
                  class="form-input w-32"
                  required
                />
                <div class="flex-1">
                  <div class="h-2 bg-gray-200 rounded-full">
                    <div
                      class="h-full bg-blue-500 rounded-full"
                      :style="{ width: `${Math.min(form.certification_criteria.importance_ratio, 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label"></label>
              <textarea
                v-model="form.certification_criteria.required"
                rows="3"
                class="form-input"
                placeholder="Enter the required criteria for this position..."
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Evaluation Criteria</label>
              <div class="space-y-3">
                <div v-for="(criterion, index) in form.certification_criteria.criteria" :key="index" class="criterion-row">
                  <div class="criterion-inputs">
                    <input
                      v-model="criterion.description"
                      type="text"
                      placeholder="Criterion description"
                      class="form-input"
                    />
                    <input
                      v-model="criterion.max_score"
                      type="number"
                      placeholder="MScore"
                      class="form-input w-32"
                    />
                    <button
                      type="button"
                      @click="removeCriterion('certification', index)"
                      class="btn-remove"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  @click="addCriterion('certification')"
                  class="btn-add w-full"
                >
                  <div class="btn-add-content">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    <span>Add Criterion</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { useStore } from 'vuex'

export default {
  name: 'JobCreationForm',
  props: {
    initialData: {
      type: Object,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const store = useStore()
    return { store }
  },
  data() {
    return {
      form: {
        title: '',
        description: '',
        department: '',
        location: '',
        requirements: '',
        min_salary: null,
        max_salary: null,
        status: 'draft',
        is_remote: false,
        employment_type: 'full-time',
        created_by: '', // This should be set from the logged in user
        background_criteria: {
          importance_ratio: 25,
          required: '',
          criteria: [{
            description: '',
            max_score: 10
          }]
        },
        project_criteria: {
          importance_ratio: 25,
          required: '',
          criteria: [{
            description: '',
            max_score: 10
          }]
        },
        skill_criteria: {
          importance_ratio: 25,
          required: '',
          criteria: [{
            description: '',
            max_score: 10
          }]
        },
        certification_criteria: {
          importance_ratio: 25,
          required: '',
          criteria: [{
            description: '',
            max_score: 10
          }]
        }
      }
    }
  },
  created() {
    // Initialize form with initialData if provided
    if (this.initialData) {
      this.form = {
        ...this.form,
        ...this.initialData,
        background_criteria: {
          ...this.form.background_criteria,
          ...(this.initialData.background_criteria || {})
        },
        project_criteria: {
          ...this.form.project_criteria,
          ...(this.initialData.project_criteria || {})
        },
        skill_criteria: {
          ...this.form.skill_criteria,
          ...(this.initialData.skill_criteria || {})
        },
        certification_criteria: {
          ...this.form.certification_criteria,
          ...(this.initialData.certification_criteria || {})
        }
      }
    }
  },
  watch: {
    'form.background_criteria.importance_ratio': function(val) {
      if (val >= 100) this.form.background_criteria.importance_ratio = 100
      if (val <= 0) this.form.background_criteria.importance_ratio = 0
      if (val % 1 !== 0) this.form.background_criteria.importance_ratio = Math.round(val)
    },
    'form.project_criteria.importance_ratio': function(val) {
      if (val >= 100) this.form.project_criteria.importance_ratio = 100
      if (val <= 0) this.form.project_criteria.importance_ratio = 0
      if (val % 1 !== 0) this.form.project_criteria.importance_ratio = Math.round(val)
    },
    'form.skill_criteria.importance_ratio': function(val) {
      if (val >= 100) this.form.skill_criteria.importance_ratio = 100
      if (val <= 0) this.form.skill_criteria.importance_ratio = 0
      if (val % 1 !== 0) this.form.skill_criteria.importance_ratio = Math.round(val)
    },
    'form.certification_criteria.importance_ratio': function(val) {
      if (val >= 100) this.form.certification_criteria.importance_ratio = 100
      if (val <= 0) this.form.certification_criteria.importance_ratio = 0
      if (val % 1 !== 0) this.form.certification_criteria.importance_ratio = Math.round(val)
    },
    'form.min_salary': function(val) {
      // Round to integer
      if (val % 1 !== 0) {
        this.form.min_salary = Math.round(val)
      }
      
      // Ensure min is not greater than max
      if (this.form.max_salary && Number(this.form.min_salary) >= Number(this.form.max_salary)) {
        this.form.min_salary = this.form.max_salary
      }
    },
    'form.max_salary': function(val) {
      // Round to integer
      if (val % 1 !== 0) {
        this.form.max_salary = Math.round(val)
      }
      
      // Ensure min is not greater than max
      if (this.form.min_salary && Number(this.form.max_salary) <= Number(this.form.min_salary)) {
        this.form.max_salary = this.form.min_salary
      }
    }
  },
  methods: {
    addCriterion(type) {
      this.form[`${type}_criteria`].criteria.push({
        description: '',
        max_score: null
      })
    },
    removeCriterion(type, index) {
      this.form[`${type}_criteria`].criteria.splice(index, 1)
    },
    validateForm() {
      // Validate total importance ratio is 100%
      const totalRatio = 
        Number(this.form.background_criteria.importance_ratio) +
        Number(this.form.project_criteria.importance_ratio) +
        Number(this.form.skill_criteria.importance_ratio) +
        Number(this.form.certification_criteria.importance_ratio)

      if (totalRatio !== 100) {
        message.error('Total importance ratio must be 100%')
        return false
      }

      // Validate all required fields
      if (!this.form.title || !this.form.department || !this.form.location || 
          !this.form.description || !this.form.requirements || !this.form.min_salary || 
          !this.form.max_salary) {
        message.error('Please fill in all required fields')
        return false
      }

      // Validate salary range
      if (Number(this.form.min_salary) > Number(this.form.max_salary)) {
        message.error('Minimum salary cannot be greater than maximum salary')
        return false
      }

      // Validate criteria
      const criteriaTypes = ['background', 'project', 'skill', 'certification']
      for (const type of criteriaTypes) {
        const criteria = this.form[`${type}_criteria`].criteria
        if (!criteria.length) {
          message.error(`Please add at least one criterion for ${type} evaluation`)
          return false
        }
        for (const criterion of criteria) {
          if (!criterion.description || !criterion.max_score) {
            message.error(`Please fill in all criterion fields for ${type} evaluation`)
            return false
          }
        }
      }
      return true
    },
    async saveJob() {
      try {
        // Ensure default values for any required fields
        if (!this.form.created_by) {
          this.form.created_by = 'admin123' // Default user ID
        }
        
        // Check if editing or creating
        if (this.isEdit) {
          const jobId = this.initialData.id;
          if (!jobId) {
            throw new Error('Job ID is required for update');
          }
          
          // Clean up the form data before sending
          const updateData = {
            ...this.form,
            id: undefined // Remove id from update data as it's in the URL
          };
          
          await this.store.dispatch('jobs/updateJob', { id: jobId, data: updateData });
          message.success('Job updated successfully');
        } else {
          await this.store.dispatch('jobs/createJob', this.form);
          message.success('Job created successfully');
        }
        
        // Emit success event to parent for UI updates
        this.$emit('success');
        return true;
      } catch (error) {
        console.error('Error saving job:', error);
        message.error('Failed to save job: ' + (error.message || 'Please try again later.'));
        return false;
      }
    },
    handleSubmit() {
      // Validate and save the form
      if (!this.validateForm()) return false;
      
      // Save job directly from the form
      return this.saveJob();
    }
  }
}
</script>

<style scoped>
.job-creation-form {
  max-width: 1200px;
  margin: 0 auto;
}

/* Target Ant Design modal body */
:global(.ant-modal-body) {
  padding: 0 !important;
}

:global(.ant-modal-content) {
  padding: 0 !important;
}

:global(.ant-modal-header .ant-modal-title) {
  font-size: 24px !important;
  font-weight: 700 !important;
  text-align: center !important;
}

.form-section {
  background: var(--card-bg, white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px var(--shadow-color, rgba(0, 0, 0, 0.1));
  border: 1px solid var(--border-color, #f0f0f0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20px;
}

.form-section:hover {
  box-shadow: 0 8px 16px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

.section-header {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
  padding-bottom: 12px;
}

.section-header h3 {
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  margin-bottom: 4px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.section-header p {
  color: var(--text-color, rgba(0, 0, 0, 0.45));
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--input-bg, white);
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  height: 40px;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.form-input::placeholder {
  color: var(--text-color, rgba(0, 0, 0, 0.45));
}

textarea.form-input {
  height: auto;
  min-height: 80px;
  resize: vertical;
}

.criterion-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  height: 40px;
}

.criterion-inputs {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;
  height: 100%;
}

.criterion-inputs .form-input:first-child {
  flex: 1;
  height: 100%;
  border-radius: 6px;
}

.criterion-inputs .form-input:nth-child(2) {
  width: 80px;
  height: 100%;
  padding: 0;
  text-align: center;
  border-radius: 6px;
}

.btn-add {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0;
  background-color: var(--card-bg, #f3f4f6);
  border: 1px dashed var(--border-color, #d1d5db);
  border-radius: 6px;
  color: var(--text-color, rgba(0, 0, 0, 0.65));
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  overflow: hidden;
  margin-top: 8px;
}

.btn-add:hover {
  background-color: var(--hover-bg, #e5e7eb);
  border-color: #1890ff;
  color: #1890ff;
  transform: translateY(-1px);
}

.btn-add-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background-color: var(--card-bg, #f3f4f6);;
  border: none;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-remove:hover {
  background-color: rgba(245, 34, 45, 0.2);
  transform: scale(1.05);
}

.btn-submit {
  padding: 10px 24px;
  background-color: #1890ff;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-submit:hover {
  background-color: #40a9ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.35);
}

.btn-submit:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

/* Progress bar styles */
.progress-bar {
  height: 4px;
  background-color: var(--border-color, #f0f0f0);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #52c41a);
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: rgba(255, 255, 255, 0.85);
    --border-color: #303030;
    --card-bg: #1f1f1f;
    --input-bg: #141414;
    --hover-bg: #303030;
    --shadow-color: rgba(0, 0, 0, 0.3);
  }
}

/* Light mode variables */
:root {
  --text-color: rgba(0, 0, 0, 0.85);
  --border-color: #f0f0f0;
  --card-bg: white;
  --input-bg: white;
  --hover-bg: #f5f5f5;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

.h-2.bg-gray-200.rounded-full {
  background-color: var(--border-color, #f0f0f0);
  height: 4px;
}

.h-full.bg-blue-500.rounded-full {
  background: linear-gradient(90deg, #1890ff, #52c41a);
  height: 100%;
  transition: width 0.3s ease;
}

.form-group label.form-label {
  font-weight: 600;
  color: var(--text-color, rgba(0, 0, 0, 0.85));
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.space-y-8 > div:not(:last-child) {
  margin-bottom: 24px;
}

/* Make headers more prominent */
.section-header h3 {
  font-size: 16px;
  margin-bottom: 8px;
}
</style> 