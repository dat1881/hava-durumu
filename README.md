

``
# Discord Hava Durumu Botu

Bu proje, Dat.1881 tarafından yapılmıştır hava durumu bilgilerini gönderen bir Discord botudur. 

## Gerekli Modüller

- `discord.js`: Discord botunu oluşturmak ve yönetmek için.
- `node-fetch`: API isteklerini yapmak için.


### Adım 1: Gerekli Modüllerin Yüklenmesi

Proje klasörünüzde gerekli modülleri yüklemek için aşağıdaki komutları çalıştırın:

```
npm i
npm install discord.js node-fetch
```

### Adım 2: Botun Çalıştırılması

Proje klasörünüzde aşağıdaki komutu çalıştırarak botu başlatın:
```

node bot.js & node .

```

## Kullanım

Discord'da botun bulunduğu bir kanalda aşağıdaki komutu kullanarak hava durumu bildirimlerini ayarlayabilirsiniz:
```

!havadurumu {şehir} (yazdığında sadece 1 şehiri gösterir)
!81il (!81il yazdığınızda bütün Türkiye'de bulunan şehirlerin hava durumunu bölgelere ayırarak gösterir.)
Ve 24 saat'te bir otomatik olarak seçtiğiniz kanala hava durumunu mesaj atar.
```
Tek sorun "!81il" komutunda biraz yavaş çalışma vardır fakat hiçbir sorun yoktu apiden kaynaklıdır durum.
