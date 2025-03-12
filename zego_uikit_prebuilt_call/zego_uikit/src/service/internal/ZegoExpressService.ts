import { zloginfo, zlogwarning, zlogerror } from "../../utils/logger"
import { PlayConfig, PushConfig } from "../defines";
import UIKitCore from "./UIKitCore";
import { ZegoExpressEvent, ZegoExpressEventKeys } from "./ZegoExpressEvent";
import { ZegoWxPublishOption } from "zego-express-engine-miniprogram/sdk/code/zh/ZegoExpressEntity.wechat";

export async function startPush(pushStreamID: string, publishOption?: ZegoWxPublishOption | undefined): Promise<PushConfig | false> {
    try {
        /** 开始推流，返回推流地址 */
        const { url } = await UIKitCore.getInstance().express.startPublishingStream(pushStreamID, publishOption);
        zloginfo('startPush for pushStreamID=', pushStreamID, ' url=', url);
        const pushContext = UIKitCore.createLivePusherContext();
        pushContext.start();
        const pusher: PushConfig = {
            mode: 'RTC',
            autopush: true,
            minBitrate: 200,
            maxBitrate: 600,
            videoAspect: '3:4',
            enableAutoFocus: false,
            url,
            streamID: pushStreamID,
            pusherContext: pushContext,
            fps: 30,
        }
        return pusher;
    } catch (error) {
        zlogerror("error", error);
        return false
    }
}

export function stopPush(pushStreamID: string) {
    UIKitCore.getInstance().express.stopPublishingStream(pushStreamID);
}


export async function startPlay(streamID: string): Promise<PlayConfig | false> {
    /** 开始拉流，返回拉流对象 */
    try {
        zloginfo("startPlay1 streamID=", streamID);
        return UIKitCore.getInstance().express.startPlayingStream(streamID, { sourceType: "BGP" })
            .then(({ url })=>{
                zloginfo("startPlay2 streamID=", streamID, 'url=', url);
                const playerContext = UIKitCore.createLivePlayerContext(streamID);
                const player: PlayConfig = {
                    mode: 'RTC',
                    autoplay: true,
                    url,
                    streamID: streamID,
                    playerContext,
                    objectFit: 'contain',
                    muteAudio: false,
                    enableMetadata: true,
                }
                return Promise.resolve(player);
            })
            .catch((err) => {
                zlogerror("startPlayingStream error", err);
                return Promise.reject(false);
            })
       
      
    } catch (error) {
        zlogerror("error", error);
        return false
    }
}

export function stopPlay(streamID: string): boolean {
    UIKitCore.getInstance().express.stopPlayingStream(streamID);
    
    return true

}

export function bindEventListeners(listeners: ZegoExpressEvent) {
    for (let key of Object.keys(listeners)) {
        const evt = key as ZegoExpressEventKeys
        UIKitCore.getInstance().express.on(evt, listeners[evt]!)
    }
}

export function unbindEventListeners(listeners: ZegoExpressEvent) {
    for (let key of Object.keys(listeners)) {
        const evt = key as ZegoExpressEventKeys
        UIKitCore.getInstance().express.off(evt, listeners[evt]!)
    }
}