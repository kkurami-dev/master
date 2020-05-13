#include <sys/time.h>

struct timeval {
    time_t tv_sec;            /* Seconds.  */
    suseconds_t tv_usec;      /* Microseconds.  */
};
int gettimeofday(struct timeval *tv, struct timezone *tz);

struct tp_data {
  int size;
  char *data;
  char start_time[128]:
};
