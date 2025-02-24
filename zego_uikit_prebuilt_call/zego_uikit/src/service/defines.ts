/**
 * 通话状态枚举
 */
export enum CallStatus {
    /**
     * 未开始
     */
    NONE = 0,
    /**
     * 申请通话中
     */
    InApply = 1,
    /**
     * 等待接听
     */
    WaitCall = 2,
    /**
     * 通话中
     */
    Calling = 3,
    /**
     * 结束通话
     */
    EndCall = 4,
    /**
     * 主动取消通话
     */
    CancelCall = 5,
    /**
     * 被取消通话
     */
    CancelledCall = 6,
    /**
     * 主动拒绝通话
     */
    RefuseCall = 7,
    /**
     * 被拒绝通话
     */
    RejectedCall = 8,
    /**
     * 邀请者接受到超时回调
     */
    CallTimeoutInviter = 9,
    /**
     * 被邀请者接受到超时回调
     */
    CallTimeoutInvitee = 10,
    /**
     * 杀进程、退后台、切换标签等触发的页面隐藏
     */
    HiddenPage = 11,
    /**
     * 主动挂断 （结束呼叫）
     */
    HangUp = 12,
    /**
     * 被挂断
     */
    HangedUp = 13,
    /**
     * 远端异常退出
     */
    RemoteAbnormalExit = 14
}

// 推流配置
export interface PushConfig {
    streamID?: string, // 流id
    url?: string, // 推流URL
    pusherContext?: any, // wx 的 pusher 实例
    mode?: 'SD' | 'HD' | 'FHD' | 'RTC', // 推流模式  SD（标清）, HD（高清）, FHD（超清）, RTC（实时通话）
    autopush?: boolean, // 是否自动推流
    enableCamera?: boolean, // 是否开启摄像头
    enableMic?: boolean, // 是否启用麦克风
    enableAgc?: boolean, // 是否启用自动增益控制
    enableAns?: boolean, // 是否启用噪声抑制
    enableEarMonitor?: boolean, // 是否启用耳返
    enableAutoFocus?: boolean, // 是否启用自动对焦
    enableZoom?: boolean, // 是否启用缩放
    minBitrate?: number, // 最小比特率, 200
    maxBitrate?: number, // 最大比特率, 500
    videoWidth?: number, // 视频宽度
    videoHeight?: number, // 视频高度
    beautyLevel?: number, // 美颜级别
    whitenessLevel?: number, // 美白级别
    videoOrientation?: 'vertical' | 'horizontal', // 视频方向
    videoAspect?: '3:4' | '9:16', // 画面比例，取值为 3:4, 或者 9:16
    frontCamera?: boolean, // 前后置摄像头，false 表示后置
    enableRemoteMirror?: boolean, // 是否启用远程镜像
    localMirror?: boolean, // 是否启用本地镜像
    enableBackgroundMute?: boolean, // 是否在背景音中静音
    audioQuality?: number, // 音频质量
    audioVolumeType?: number, // 音频音量类型
    audioReverbType?: number, // 音频混响类型
    waitingImage?: string, // 等待图片的URL
    beautyStyle?: string, // 美颜风格
    filter?: string, // 滤镜
    fps?: number, // 帧率，有效值为 1~30
}

// 拉流配置
export interface PlayConfig {
    streamID?: string, // 流id
    playerContext?: any, // wx 的 player实例
    url?: string, // 播放源URL
    mode?: 'live' | 'RTC', // 播放模式, RTC：实时通话， live：直播模式，对应小程序 live-player 的 mode 属性
    autoplay?: boolean, // 是否自动播放
    muteAudio?: boolean, // 是否静音音频
    muteVideo?: boolean, // 是否静音视频
    orientation?: string, // 播放画面的方向
    objectFit?: string, // 视频画面的适应方式
    minCache?: number, // 最小缓冲区大小
    maxCache?: number, // 最大缓冲区大小
    soundMode?: string, // 声音模式
    enableRecvMessage?: boolean, // 是否启用接收消息
    autoPauseIfNavigate?: boolean, // 导航时是否自动暂停
    autoPauseIfOpenNative?: boolean, // 打开原生页面时是否自动暂停
    enableMetadata?: boolean, // 是否启用元数据
}

// zim 呼叫邀请用户状态
export enum ZIMCallUserState {
	Unknown = -1,
	Inviting = 0,
	Accepted = 1,
	Rejected = 2,
	Cancelled = 3,
	Received = 5,
	Timeout = 6,
	Quit = 7,
	Ended = 8,
	NotYetReceived = 9,
	BeCancelled = 10,
}

/**
 * 用户信息接口，用于描述房间内的用户状态。
 */
export interface ZegoUIKitUser {
    userID: string;
    userName?: string;
    avatar?: string;
    isCameraOn?: boolean;
    isMicrophoneOn?: boolean;
    streamConfig?: any;
    mainStreamID?: string;
    shareStreamID?: string;
    soundLevel?: number;
    attributes?: Record<string, string>;
}

/**
 * 呼叫邀请相关监听接口，用于监听呼叫邀请的状态变化。
 */
export interface ZegoCallInvitationListener {
    onCallInvitationCreated?:(callID: string, extendedData: string) => void;
    onCallInvitationAccepted?: (callID: string, callerID: string, calleeID: string) => void;
    onCallInvitationRefused?: (callID: string, callerID: string, calleeID: string, extendedData: string) => void;
    onCallInvitationCancelled?: (callID: string, caller: ZegoUIKitUser, extendedData: string) => void;
    onCallInvitationReceived?: (callID: string, extendedData: string) => void;
    onCallInvitationTimeoutofInviter?: (callID: string, calleeID: string, extendedData?: string) => void;
    onCallInvitationTimeoutofInvitee?: (callID: string, caller: ZegoUIKitUser) => void;
    onZIMTokenWillExpire?: () => void
    onCallEnded?: () => void
}

export interface ZegoUIKitListener {
    // 更新本端用户信息
    onLocalUserUpdated?: (user: ZegoUIKitUser) => void;
    onUserLeaved?: (user: ZegoUIKitUser) => void;
    onUserListUpdated?: (userList: ZegoUIKitUser[]) => void;
    onReconnected?: () => void;
}

// !重要: 这些配置是从Android拷贝过来的, 有些可能不适合小程序

export enum ScenarioModel {
    SINGLE_CALL,    // 1v1 单聊
    GROUP_CALL,   //  群聊
}

export interface ZegoUIKitConfig {
    /**
     * 默认是否启用摄像头，默认值为启用
     */
    turnOnCameraWhenJoining?: boolean;

    /**
     * 默认是否启用麦克风，默认为启用
     */
    turnOnMicrophoneWhenJoining?: boolean;

    /**
     * 呼叫模式
     */
    mode?: ZegoUIKitScenario;

    /**
     * token 过期回调
     */
    onTokenWillExpire?: (roomID: string) => void;
}
// export interface ZegoUIKitPrebuiltCallConfig {

//     /**
//      * 通话模式
//      */
//     scenarioModel?: ScenarioModel;

//     /**
//      * 语言设置
//      */
//     language?: Language;

//     /**
//      * 配置音视频视图的 UI，如麦克风和摄像头状态图标、是否显示用户名、声浪效果和视频显示模式
//      */
//     audioVideoViewConfig?: ZegoPrebuiltAudioVideoViewConfig;

//     /**
//      * 通话页面底部栏的配置参数，如底部的栏按钮、按钮数量限制、是否自动隐藏、点击其他区域是否隐藏以及颜色风格
//      */
//     bottomMenuBarConfig?: ZegoBottomMenuBarConfig;

//     /**
//      * 通话页面音视频窗口显示样式，包括画中画布局、流式布局
//      */
//     // layout: LayoutConfig;

//     /**
//      * 默认是否启用摄像头，默认值为启用
//      */
//     turnOnCameraWhenJoining?: boolean;

//     /**
//      * 默认是否启用麦克风，默认为启用
//      */
//     turnOnMicrophoneWhenJoining?: boolean;

//     /**
//      * 默认是否启用扬声器
//      */
//     // useSpeakerWhenJoining?: boolean;

//     /**
//      * 点击挂断按钮时，是否显示离开房间的对话框信息。如果没有设置，则不显示，反之亦然。
//      */
//     // hangUpConfirmDialogInfo?: HangUpConfirmDialogInfo;

//     /**
//      * 通话成员列表显示配置，如成员的摄像头和麦克风状态。
//      */
//     // memberListConfig?: ZegoMemberListConfig;

//     /**
//      * 通话页面顶部栏的配置参数，如顶部的栏按钮、按钮数量限制、是否自动隐藏、点击其他区域是否隐藏以及颜色风格。
//      */
//     // topMenuBarConfig: ZegoTopMenuBarConfig;

//     /**
//      * 是否显示通话时长。默认值为 null。
//      */
//     // durationConfig?: ZegoCallDurationConfig;

//     /**
//      * 配置房间内聊天的标题和输入提示，或自定义房间内聊天视图。
//      */
//     // inRoomChatConfig?: InRoomChatConfig;

//     /**
//      * 通话视频的分辨率，默认值为 360p。
//      */
//     // videoConfig?: VideoConfig;

//     /**
//      * 自定义用户头像。
//      */
//     zegoAvatarViewProvider?: ZegoAvatarViewProvider;
// }

export enum ZegoUIKitScenario {
    SINGLE_CALL,    // 1v1 单聊
    GROUP_CALL,   //  群聊
    CALL_INVITATION,
}

export enum Language {
    ZH = 'zh',
    EN = 'en',
}

export interface ZegoPrebuiltAudioVideoViewConfig {
    /**
     * 控制是否在 VideoView 上显示预制层的默认 MicrophoneStateIcon。
     */
    showMicrophoneStateOnView: boolean;

    /**
     * 控制是否在 VideoView 上显示预制层的默认 CameraStateIcon。
     */
    showCameraStateOnView: boolean;

    /**
     * 控制是否在 VideoView 上显示预制层的默认 UserNameLabel。
     */
    showUserNameOnView: boolean;

    /**
     * 在语音模式下是否显示头像周围的声浪。
     */
    showSoundWavesInAudioMode: boolean;

    /**
     * 默认为 true，正常的黑边模式（否则横屏会难看）。
     */
    // useVideoViewAspectFill: boolean;

    /**
     * 自定义视频视图前景 View。
     */
    // videoViewForegroundViewProvider?: any;
}

export interface ZegoBottomMenuBarConfig {
    /**
     * 需要在 MenuBar 上显示的按钮，按照实际 List 的顺序显示。
     */
    // buttons: string[];

    /**
     * MenuBar 上可以显示的按钮的最大数量，最多为 5个。如果超过这个值，则会显示“更多”按钮。注意，这个值包含了“更多”按钮。
     */
    // maxCount: number;

    /**
     * 5 秒内没有操作屏幕，或者用户点击屏幕非响应区域的位置，顶部和底部会自动收起。
     */
    hideAutomatically: boolean;

    /**
     * 用户是否可以点击屏幕非响应区域的位置，并收起顶部和底部。
     */
    // hideByClick: boolean;

    /**
     * MenuBar 显示颜色，有高亮和暗色两种。
     */
    // style: string;

    /**
     * MenuBar按钮配置，使用此配置来改变按钮的图标。
     */
    buttonConfig: ZegoMenuBarButtonConfig;
}

export interface ZegoMemberListConfig {
    /**
     * 是否显示麦克风的状态图标，默认值为 true。
     */
    showMicrophoneState: boolean;

    /**
     * 是否显示摄像头的状态图标，默认值为 true。
     */
    showCameraState: boolean;

    /**
     * 自定义成员列表视图。
     */
    memberListItemProvider?: any;
}

export interface ZegoTopMenuBarConfig {
    /**
     * 需要在 MenuBar 上显示的按钮，按照实际 List 的顺序显示。
     */
    buttons: string[];

    /**
     * 5 秒内没有操作屏幕，或者用户点击屏幕非响应区域的位置，顶部和底部会自动收起。
     */
    hideAutomatically: boolean;

    /**
     * 用户是否可以点击屏幕的非响应区域来收起顶部和底部的菜单栏。
     */
    hideByClick: boolean;

    /**
     * MenuBar 的显示颜色，有两种风格：高亮和暗色。
     */
    style: string;

    /**
     * 是否可见，默认值为 false。
     */
    isVisible: boolean;

    /**
     * MenuBar 按钮配置，使用此配置修改按钮的图标。
     */
    buttonConfig: ZegoMenuBarButtonConfig;
}

export interface ZegoCallDurationConfig {
    /**
     * 是否显示通话时间时长，默认值为 true。
     */
    isVisible: boolean;

    /**
     * 通话时长更新的回调。
     */
    durationUpdateListener?: () => void;
}


export interface ZegoMenuBarButtonConfig {
    /**
     * 自定义摄像头开启状态的按钮图标。
     */
    toggleCameraOnImage: string;

    /**
     * 自定义摄像头关闭状态的按钮图标。
     */
    toggleCameraOffImage: string;

    /**
     * 自定义麦克风开启状态的按钮图标。
     */
    toggleMicrophoneOnImage: string;

    /**
     * 自定义麦克风关闭状态的按钮图标。
     */
    toggleMicrophoneOffImage: string;

    /**
     * 自定义挂断按钮的图标。
     */
    hangUpButtonImage: string;

    /**
     * 自定义切换至前置摄像头的按钮图标。
     */
    switchCameraFrontImage: string;

    /**
     * 自定义切换至后置摄像头的按钮图标。
     */
    switchCameraBackImage: string;

    /**
     * 自定义显示成员列表的按钮图标。
     */
    // showMemberListButtonImage: string;

    /**
     * 自定义聊天按钮的图标。
     */
    // chatButtonImage: string;

    /**
     * 自定义最小化按钮的图标。
     */
    // minimizingButtonImage: string;

    /**
     * 自定义扬声器音频输出状态的按钮图标。
     */
    // audioOutputSpeakerImage: string;

    /**
     * 自定义耳机音频输出状态的按钮图标。
     */
    // audioOutputEarSpeakerImage: string;

    /**
     * 自定义蓝牙音频输出状态的按钮图标。
     */
    // audioOutputBluetoothImage: string;

    /**
     * 自定义屏幕共享切换按钮开启状态的图标。
     */
    // screenSharingToggleButtonOnImage: string;

    /**
     * 自定义屏幕共享切换按钮关闭状态的图标。
     */
    // screenSharingToggleButtonOffImage: string;

    /**
     * 自定义美颜按钮的图标。
     */
    // beautyButtonImage: string;
}

export interface LayoutConfig {
    /**
     * 通话页面音视频窗口显示样式，包括画中画布局、流式布局
     */
    layoutType: 'picture-in-picture' | 'streaming';
}

export interface HangUpConfirmDialogInfo {
    /**
     * 是否显示离开房间的对话框信息。
     */
    showDialog: boolean;

    /**
     * 对话框信息内容。
     */
    dialogMessage?: string;
}

export interface InRoomChatConfig {
    /**
     * 房间内聊天的标题。
     */
    chatTitle: string;

    /**
     * 房间内聊天的输入提示。
     */
    inputPlaceholder: string;

    /**
     * 自定义房间内聊天视图。
     */
    // customChatView?: any
}


export interface VideoConfig {
    /**
     * 通话视频的分辨率，默认值为 360p。
     */
    resolution: string;
}

export interface ZegoAvatarViewProvider {
    /**
     * 自定义用户头像。
     */
    getAvatar: (userId: string) => string;
}