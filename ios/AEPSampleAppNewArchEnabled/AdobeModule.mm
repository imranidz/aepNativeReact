#import "AdobeModule.h"
#import "AppDelegate.h"

@implementation AdobeModule

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(setAppId:(NSString *)appId)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [AppDelegate setAdobeAppId:appId];
    });
}

@end 