### Проверить работу сервера

Запустить сервер
```bash
java -DFCGI_PORT=13041 -jar app/build/libs/Server.jar
```

Отправить get запрос
```bash
curl -X POST -d "x=5&y=10" http://localhost:13040/
```

### Helios

Запустить apache
``` shell
/usr/local/sbin/httpd -f /home/studs/s466560/httpd-root/httpd-conf.conf -X
```

Пробросить порт
```bash
ssh -L 8080:localhost:13041 s466560@helios.cs.ifmo.ru -p 2222
```
      }

	Запустить сервер
```bash
java -DFCGI_PORT=13041 -jar httpd-root/fcgi-bin/Server.jar
```

Перейти на сайт 
```
http://localhost:8080
https://helios.cs.ifmo.ru:<PORT>/httpd-root/fcgi-bin/Server.jars
```



Он предлагает запускать сервер не отдельным процессом, а сразу

Вы используете **`FastCgiExternalServer`**, который **ожидает внешний процесс**, слушающий на TCP-порту (например, `localhost:13040`). Но ваш сервер `Server.java` — это **FastCGI-приложение**, которое **само слушает stdin/stdout**, а не TCP.
> ✅ **Правильный способ** — использовать **`FastCgiServer`** или **`FastCgiConfig`**, но в вашем случае, поскольку вы используете **`FCGIInterface`** (библиотека, которая работает через stdin/stdout), **нужно запускать сервер как отдельный процесс через `FastCgiServer`**.

Вместо этого:
```apache
FastCgiExternalServer "/home/studs/s466560/httpd-root/fcgi-bin/server.jar" -host localhost:13040 -nph
Alias /fcgi-bin/ "/home/studs/s466560/httpd-root/fcgi-bin/server.jar"
<Directory "/home/studs/s466560/httpd-root/fcgi-bin">
     AllowOverride None
     Options None
     Require all granted
</Directory>
```
Это:
```apache
# Запуск FastCGI-приложения как внешний процесс через скрипт-обёртку
# Создайте файл: /home/studs/s466560/httpd-root/fcgi-bin/start-server.sh

# Укажите путь к вашему JAR-файлу
FastCgiServer "/home/studs/s466560/httpd-root/fcgi-bin/start-server.sh" -processes 1 -idle-timeout 60

# Настраиваем обработку запросов к /api/ через этот сервер
Alias /api/ "/home/studs/s466560/httpd-root/fcgi-bin/start-server.sh"

<Directory "/home/studs/s466560/httpd-root/fcgi-bin">
    AllowOverride None
    Options ExecCGI
    Require all granted
</Directory>
```

Сделать скрипт в bash
```bash
#!/bin/bash
cd /home/studs/s466560/httpd-root/fcgi-bin/
exec /usr/bin/java -jar server.jar
```
И дать права на исполнение
```bash
chmod +x /home/studs/s466560/httpd-root/fcgi-bin/start-server.sh
```
![[Pasted image 20250927172206.png]]
