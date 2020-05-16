
CFLAGS      = -std=c99 -pedantic -Wall -g -Wextra -Wno-unused-parameter -Wno-unused-function -Wno-overlength-strings
INCLUDES    = -I ~/tools/include
LFLAGS      = -L ~/tools/lib
LIBS        = -lssl -lcrypto -pthread -lm -ldl -lrt

#CFLAGS     += -fsanitize=address -fno-omit-frame-pointer -g
#CFLAGS     += -fsanitize=memory -fno-omit-frame-pointer -g -fsanitize-memory-track-origins

# Linux example
#INCLUDES   = -I$(HOME)/my-openssl/include
#LFLAGS     = -L$(HOME)/my-openssl/lib

# mac OS example
#INCLUDES   = -I/usr/local/opt/openssl@1.1/include
#LFLAGS	    = -L/usr/local/opt/openssl@1.1/lib

all     : dtls_udp_echo
dtls_udp_echo: dtls_udp_echo.c
	$(CC) $(CFLAGS) $(INCLUDES) -o dtls_udp_echo dtls_udp_echo.c $(LFLAGS) $(LIBS)

clean:
	rm -f dtls_udp_echo
