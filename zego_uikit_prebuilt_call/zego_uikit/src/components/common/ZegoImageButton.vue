<template>
    <view class="button-container" @click.stop="onPressed" :style="{ backgroundColor: `${backgroundColor}`, width: `${width}rpx`, height: `${height}rpx`, borderRadius: `${borderRadius}%` }">
        <image :src="image" 
            :style="{ width: `${iconWidth}rpx`, height: `${iconHeight}rpx` }"
            mode="aspectFit" 
            class="image"
            @error="imageError" />
    </view>
</template>

<script setup lang="ts">
let isClicked = false;
const props = withDefaults(defineProps<{
    image: string,
    onPress?: () => void,
    width?: number,
    height?: number,
    borderRadius?: number,
    backgroundColor?: string,
    iconWidth?: number,
    iconHeight?: number,
}>(), {
    width: 48,
    height: 48,
});

const onPressed = () => {
    if(isClicked) return;
    isClicked = true;
    props.onPress?.();
    setTimeout(() => {
        isClicked = false;
    }, 5000);
}
const imageError = (e: any) => {
    console.log(`Load ${props.image} error: ${JSON.stringify(e)}`)
}

</script>

<style scoped>
.button-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.image {
    flex: 1;
}
</style>