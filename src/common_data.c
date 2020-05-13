
tp_data data =
  {
   {1, },
};

int get_data( int count, tp_data *data )
{
  struct timeval tv;

  
  gettimeofday(&tv, NULL);
  sprintf(tp_data.start_time, "%ld, %06lu\n", tv.tv_sec, tv.tv_usec);
}

