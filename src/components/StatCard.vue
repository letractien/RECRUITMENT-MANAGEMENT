<template>
  <a-card class="stat-card" :bordered="false" hoverable>
    <div :class="['stat-content', type]">
      <div class="stat-header">{{ title }}</div>
      <div class="stat-value">{{ formattedValue }}</div>
      <div :class="['stat-change', changeDirection]" v-if="showChange">
        <arrow-up-outlined v-if="change >= 0" />
        <arrow-down-outlined v-else />
        {{ formattedChange }}
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';
import { formatNumber } from '@/utils/helpers';

// Props definition
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  change: {
    type: Number,
    default: null
  },
  type: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value)
  },
  unit: {
    type: String,
    default: ''
  },
  changeLabel: {
    type: String,
    default: 'from last period'
  }
});

// Computed properties
const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return formatNumber(props.value) + (props.unit ? ` ${props.unit}` : '');
  }
  return props.value;
});

const showChange = computed(() => {
  return props.change !== null;
});

const changeDirection = computed(() => {
  return props.change >= 0 ? 'positive' : 'negative';
});

const formattedChange = computed(() => {
  if (props.change === null) return '';
  return `${Math.abs(props.change)}% ${props.changeLabel}`;
});
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--shadow-color);
  background-color: var(--card-bg);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px var(--shadow-color);
}

.stat-content {
  display: flex;
  flex-direction: column;
  padding: 16px;
  position: relative;
  border-radius: 10px;
}

.stat-content.primary {
  background: linear-gradient(45deg, rgba(24, 144, 255, 0.05), rgba(24, 144, 255, 0.1));
  border-left: 4px solid #1890ff;
}

.stat-content.success {
  background: linear-gradient(45deg, rgba(82, 196, 26, 0.05), rgba(82, 196, 26, 0.1));
  border-left: 4px solid #52c41a;
}

.stat-content.warning {
  background: linear-gradient(45deg, rgba(250, 173, 20, 0.05), rgba(250, 173, 20, 0.1));
  border-left: 4px solid #faad14;
}

.stat-content.danger {
  background: linear-gradient(45deg, rgba(245, 34, 45, 0.05), rgba(245, 34, 45, 0.1));
  border-left: 4px solid #f5222d;
}

.stat-header {
  font-size: 15px;
  color: var(--text-color);
  opacity: 0.85;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 34px;
  font-weight: 700;
  color: var(--text-color);
  margin: 4px 0;
  transition: color 0.3s ease;
}

.stat-card:hover .stat-value {
  color: #1890ff;
}

.stat-change {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.75;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: #52c41a;
  font-weight: 600;
}

.stat-change.negative {
  color: #f5222d;
  font-weight: 600;
}
</style> 