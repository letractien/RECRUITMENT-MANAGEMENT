import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser, getUser } from '../api/auth';
import { ElMessage } from 'element-plus';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: getUser() || null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    username: (state) => state.user?.username || '',
    userId: (state) => state.user?.id || ''
  },
  
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await loginApi(credentials);
        this.user = response.user;
        ElMessage.success('Đăng nhập thành công!');
        return response;
      } catch (error) {
        this.error = error.message || 'Đăng nhập thất bại';
        ElMessage.error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await registerApi(userData);
        this.user = response.user;
        ElMessage.success('Đăng ký thành công!');
        return response;
      } catch (error) {
        this.error = error.message || 'Đăng ký thất bại';
        ElMessage.error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      logoutApi();
      this.user = null;
      ElMessage.success('Đăng xuất thành công!');
    },
    
    async fetchCurrentUser() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await getCurrentUser();
        this.user = response.user;
        return response.user;
      } catch (error) {
        this.error = error.message || 'Lỗi lấy thông tin người dùng';
        console.error(this.error);
        // Do not throw here to prevent app crashes on auth issues
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
}); 