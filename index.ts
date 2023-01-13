import { serve } from 'https://deno.land/std@0.140.0/http/server.ts';
import ical from 'https://esm.sh/ical-generator@latest';

interface CheckedOut {
  total_count: number;
  books: {
    id: number;
    kind: string;
    has_childs: string;
    has_digital_book: string;
    title: string;
    title_kana: string;
    series: string;
    author: string;
    author_kana: string;
    publisher: string;
    publisher_kana: string;
    publish_date: string;
    jan: string;
    isbn: string;
    book_image: string;
    available: string;
    lend_status: number;
    reservable: string;
    has_copies: string;
    has_irl_info: string;
    checkedout_place: string;
    checkedout_date: string;
    status: string;
    due_date: string;
    extendable: number;
    bmmei: string;
    material_cd: string;
  }[];
}

serve(async () => {
  const resp = await fetch(`${Deno.env.get('BASEURL')}/api/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({
      grant_type: 'password',
      username: Deno.env.get('USERNAME'),
      password: Deno.env.get('PASSWORD'),
      client_id: 'ac5dcbd8-c856-4e9d-a15e-053b5a3da9ec',
      client_secret: 'fyyODIIJNN8rRGYM3pVAEpR8QVnLpvfP',
      lang: 'ja',
      target: 'general',
    }),
  });

  const { access_token } = await resp.json();
  if (typeof access_token !== 'string') throw 'access_token can\'t be fetched';

  const resp2 = await fetch(`${Deno.env.get('BASEURL')}/api/checkedout?lang=ja&target=general`, {
    headers: {
      authorization: `Bearer ${access_token}`,
      cookie: resp.headers.get('set-cookie') ?? '',
    },
  });

  const checkedoutData: CheckedOut = await resp2.json();

  const calendar = new ical.ICalCalendar();
  for (const book of checkedoutData.books) {
    calendar.createEvent({
      allDay: true,
      end: new Date(book.due_date),
      start: new Date(book.due_date),
      summary: `${book.title} 返却日`,
    });
  }

  return new Response(calendar.toString(), {
    headers: { 'content-type': 'text/calendar' },
  });
});
