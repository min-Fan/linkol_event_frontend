# 用户活动奖励全局状态管理

## 概述

我们已经将 `getUserActivityReward` 的数据迁移到 Redux store 中，实现了全局状态管理，方便在任何组件中访问和更新用户活动奖励数据。

## 主要特性

1. **全局状态存储**：按 eventId 分组存储用户活动奖励数据
2. **实时数据**：每次页面加载都获取最新数据，确保数据实时性
3. **实时更新**：任何组件都可以更新数据，其他组件会自动获得最新状态
4. **加载状态管理**：提供每个 eventId 的加载状态
5. **自动刷新**：组件挂载时自动获取最新数据

## 使用方法

### 1. 在组件中获取数据

```typescript
import useUserActivityReward from '@hooks/useUserActivityReward';

function MyComponent({ eventId }) {
  const {
    data,                    // 原始数据对象
    isLoading,              // 加载状态
    refetch,                // 手动刷新函数
    clearData,              // 清除数据函数
    // 便捷属性
    availableReward,        // 可用奖励数量
    totalReward,            // 总奖励数量
    totalReceiveAmount,     // 可领取总金额
    ticketNumber,           // 抽奖券数量
    rewardPercent,          // 奖励比例
  } = useUserActivityReward({
    eventId: eventId.toString(),
    enabled: true,          // 是否启用自动获取
  });

  return (
    <div>
      <p>可领取金额: {totalReceiveAmount}</p>
      <p>抽奖券数量: {ticketNumber}</p>
      <button onClick={refetch}>刷新数据</button>
    </div>
  );
}
```

### 2. 在任何地方更新数据

```typescript
import useUserActivityRewardUpdater from '@hooks/useUserActivityRewardUpdater';

function AnyComponent() {
  const { updateRewardData, setRewardData } = useUserActivityRewardUpdater();

  const handleUpdateData = async () => {
    // 从服务器获取最新数据并更新 store
    await updateRewardData('event123');
  };

  const handleLocalUpdate = () => {
    // 直接设置本地数据（比如在某些操作后立即更新UI）
    setRewardData('event123', {
      available_reward: 5,
      total_reward: 10,
      total_receive_amount: 100,
      number: 3,
      percent: 50,
    });
  };

  return (
    <div>
      <button onClick={handleUpdateData}>从服务器更新</button>
      <button onClick={handleLocalUpdate}>本地更新</button>
    </div>
  );
}
```

### 3. 直接访问 store 数据

```typescript
import { useAppSelector } from '@store/hooks';

function SomeComponent({ eventId }) {
  const userActivityRewardState = useAppSelector(
    (state) => state.userReducer?.userActivityRewards?.[eventId]
  );

  const data = userActivityRewardState?.data;
  const isLoading = userActivityRewardState?.isLoading;
  const lastUpdated = userActivityRewardState?.lastUpdated;

  return (
    <div>
      {isLoading ? (
        <p>加载中...</p>
      ) : (
        <p>最后更新: {new Date(lastUpdated).toLocaleString()}</p>
      )}
    </div>
  );
}
```

## Store 结构

```typescript
interface UserState {
  userActivityRewards: {
    [eventId: string]: {
      data: {
        available_reward: number;
        total_reward: number;
        total_receive_amount: number;
        number: number;
        percent: number;
      } | null;
      isLoading: boolean;
      lastUpdated: number;
    };
  };
}
```

## Redux Actions

- `setUserActivityRewardLoading`: 设置加载状态
- `updateUserActivityReward`: 更新奖励数据
- `clearUserActivityReward`: 清除指定 eventId 的数据
- `clearAllUserActivityRewards`: 清除所有奖励数据

## 已更新的组件

1. **RaffleRewardCard**: 抽奖奖励卡片
2. **PlatformRewardCard**: 平台奖励卡片
3. **DialogClaimReward**: 领取奖励弹窗

这些组件现在都使用全局 store 中的数据，任何一个组件更新数据后，其他组件会自动显示最新状态。

## 优势

1. **实时数据**: 每次页面加载都获取最新数据，确保数据的实时性和准确性
2. **状态一致性**: 所有组件显示的数据保持同步
3. **更好的用户体验**: 数据更新后立即反映在所有相关UI上
4. **易于维护**: 集中管理数据逻辑，便于调试和维护
5. **灵活性**: 可以在任何地方访问和更新数据，不受组件层级限制
6. **始终最新**: 避免显示过期数据，用户始终看到最新的奖励信息
