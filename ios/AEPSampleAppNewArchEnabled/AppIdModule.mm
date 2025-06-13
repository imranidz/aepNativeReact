#import "AppIdModule.h"
#import "AppDelegate.h"

@implementation AppIdModule

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(configureWithAppId:(NSString *)appId)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [AppDelegate setAdobeAppId:appId];
    });
}

@end 