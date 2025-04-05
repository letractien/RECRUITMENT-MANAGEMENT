<template>
  <div class="login-page">
    <el-card class="login-card">
      <div class="logo-container">
        <h1 class="app-title">Recruitment Management</h1>
      </div>
      
      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane label="Đăng nhập" name="login">
          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            @submit.prevent="handleLogin"
          >
            <el-form-item label="Email" prop="email">
              <el-input 
                v-model="loginForm.email" 
                placeholder="Email của bạn"
                :prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item label="Mật khẩu" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="Mật khẩu"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <div class="login-options">
              <el-checkbox v-model="rememberMe">Nhớ mật khẩu</el-checkbox>
              <el-link type="primary">Quên mật khẩu?</el-link>
            </div>
            
            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="authStore.loading"
                class="login-button"
              >
                Đăng nhập
              </el-button>
            </el-form-item>

            <div class="default-admin-info">
              <el-alert
                title="Tài khoản mặc định"
                type="info"
                :closable="false"
                description="Email: admin@example.com | Mật khẩu: admin"
                show-icon
              />
              <el-button type="text" @click="loginAsAdmin" class="admin-login-btn">
                Đăng nhập bằng tài khoản Admin
              </el-button>
            </div>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="Đăng ký" name="register">
          <el-form
            ref="registerForm"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            @submit.prevent="handleRegister"
          >
            <el-form-item label="Tên đăng nhập" prop="username">
              <el-input 
                v-model="registerForm.username" 
                placeholder="Tên đăng nhập"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item label="Email" prop="email">
              <el-input 
                v-model="registerForm.email" 
                placeholder="Email của bạn"
                :prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item label="Mật khẩu" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="Xác nhận mật khẩu" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="Nhập lại mật khẩu"
                :prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                native-type="submit"
                :loading="authStore.loading"
                class="register-button"
              >
                Đăng ký
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { Lock, Message, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

const activeTab = ref('login');
const rememberMe = ref(false);
const loginForm = reactive({
  email: '',
  password: ''
});

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const loginForm_ref = ref(null);
const registerForm_ref = ref(null);

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Vui lòng nhập mật khẩu'));
  } else if (value.length < 6) {
    callback(new Error('Mật khẩu phải có ít nhất 6 ký tự'));
  } else {
    callback();
  }
};

const validateConfirmPass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Vui lòng xác nhận mật khẩu'));
  } else if (value !== registerForm.password) {
    callback(new Error('Mật khẩu không khớp'));
  } else {
    callback();
  }
};

const loginRules = {
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }
  ]
};

const registerRules = {
  username: [
    { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng xác nhận mật khẩu', trigger: 'blur' },
    { validator: validateConfirmPass, trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  if (!loginForm_ref.value) return;
  
  try {
    await loginForm_ref.value.validate();
    
    await authStore.login({
      email: loginForm.email,
      password: loginForm.password
    });
    
    router.push('/dashboard');
  } catch (error) {
    // Validation or login error, already handled in the store
    console.error('Login error:', error);
  }
};

const loginAsAdmin = async () => {
  loginForm.email = 'admin@example.com';
  loginForm.password = 'admin';
  
  try {
    await authStore.login({
      email: loginForm.email,
      password: loginForm.password
    });
    
    router.push('/dashboard');
  } catch (error) {
    console.error('Admin login error:', error);
    ElMessage.error('Không thể đăng nhập với tài khoản admin. Đảm bảo backend đang chạy và admin đã được tạo.');
  }
};

const handleRegister = async () => {
  if (!registerForm_ref.value) return;
  
  try {
    await registerForm_ref.value.validate();
    
    await authStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    });
    
    ElMessage.success('Đăng ký thành công! Vui lòng đăng nhập.');
    activeTab.value = 'login';
    registerForm.username = '';
    registerForm.email = '';
    registerForm.password = '';
    registerForm.confirmPassword = '';
  } catch (error) {
    // Validation or register error, already handled in the store
    console.error('Register error:', error);
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  width: 420px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 0;
  overflow: hidden;
}

.logo-container {
  text-align: center;
  padding: 24px 0;
}

.app-title {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
  font-weight: 700;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.login-button,
.register-button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}

.default-admin-info {
  margin-top: 16px;
}

.admin-login-btn {
  margin-top: 8px;
  width: 100%;
  display: block;
  text-align: center;
}

:deep(.el-input__inner) {
  padding-left: 44px;
}

:deep(.el-input__prefix) {
  left: 14px;
}

:deep(.el-tabs__header) {
  margin-bottom: 24px;
}

:deep(.el-tabs__nav) {
  width: 100%;
}

:deep(.el-tabs__item) {
  width: 50%;
  text-align: center;
  font-size: 16px;
}

:deep(.el-form) {
  padding: 0 24px 24px;
}

:deep(.el-card__body) {
  padding: 0;
}

@media (max-width: 480px) {
  .login-card {
    width: 90%;
    max-width: 380px;
  }
  
  :deep(.el-form) {
    padding: 0 16px 16px;
  }
}
</style>