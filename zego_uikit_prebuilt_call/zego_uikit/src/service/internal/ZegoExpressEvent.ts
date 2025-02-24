import { ZegoEvent } from "zego-express-engine-miniprogram/sdk/code/zh/ZegoExpressEntity.wechat";

// 重新包装一下 RTC 的事件, 做成可选的
export interface ZegoExpressEvent {
    publishQualityUpdate?: ZegoEvent["publishQualityUpdate"];
    publisherStateUpdate?: ZegoEvent["publisherStateUpdate"];
    roomStreamUpdate?: ZegoEvent["roomStreamUpdate"];
    playQualityUpdate?: ZegoEvent["playQualityUpdate"];
    streamExtraInfoUpdate?: ZegoEvent["streamExtraInfoUpdate"];
    playerStateUpdate?: ZegoEvent["playerStateUpdate"];
    roomUserUpdate?: ZegoEvent["roomUserUpdate"];
    roomStateUpdate?: ZegoEvent["roomStateUpdate"];
    roomOnlineUserCountUpdate?: ZegoEvent["roomOnlineUserCountUpdate"];
    IMRecvBroadcastMessage?: ZegoEvent["IMRecvBroadcastMessage"];
    IMRecvBarrageMessage?: ZegoEvent["IMRecvBarrageMessage"];
    IMRecvCustomCommand?: ZegoEvent["IMRecvCustomCommand"];
    roomExtraInfoUpdate?: ZegoEvent["roomExtraInfoUpdate"];
    tokenWillExpire?: ZegoEvent["tokenWillExpire"];
    hallStateUpdate?: ZegoEvent["hallStateUpdate"];
    roomStateChanged?: ZegoEvent["roomStateChanged"];
}

export type ZegoExpressEventKeys = Partial<keyof ZegoExpressEvent>