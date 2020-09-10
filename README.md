
# About

UnisonHT plugin for [pigpio-ir](https://github.com/joeferner/pigpio-ir)

# Usage

Record IR buttons using pigpio-ir's `irrecord`. In this example you would record for two remotes `ir-receiver`
and `my-device-name`. In this case any button received by `ir-receiver` will be posted to the root
`/button/<button-name>` route. You can then send signals out using
`unisonht.executePost('/device/my-device-name/button/<on>')`

```javascript
unisonht.use(
  new PigpioIrReceiver('ir-receiver', {
    pigpioIr
  }),
);

unisonht.use(
  new PigpioIrDevice('my-device-name', {
    pigpioIr
  }),
);
```
