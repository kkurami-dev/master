
int senddata_size[] =
  {
   /* 送信  */
   100,
   100,
   100,
   100,
   100,
  };

int get_data( int count, tp_data *data )
{
  struct timeval tv;

  /* 送信データ作成 (1000回毎にデータサイズを変更)  */
  

  /* https://www.mm2d.net/main/prog/c/time-04.html  */
  gettimeofday(&tv, NULL);
  sprintf(tp_data->start_time, "%ld, %06lu\n", tv.tv_sec, tv.tv_usec);
}

