import { OpenTDBCategory } from '../dtos/open-tdb.dto';

export const transformToMyTopic = (category: OpenTDBCategory) => {
  switch (category) {
    case 'Mythology':
    case 'Entertainment: Books':
      return 'Art';

    case 'Sports':
      return 'Sports';

    case 'History':
    case 'Politics':
      return 'History';

    case 'Animals':
    case 'Science: Computers':
    case 'Science & Nature':
    case 'Science: Mathematics':
      return 'Science';

    case 'Entertainment: Television':
    case 'Entertainment: Film':
    case 'Celebrities':
      return 'Showbiz';

    case 'Geography':
      return 'Geography';

    case 'General Knowledge':
    case 'Vehicles':
      return 'General';

    case 'Entertainment: Music':
      return 'Music';

    default:
      return 'General';
  }
};

export const cleanString = (string: string) =>
  string
    .replaceAll('&quot;', '')
    .replaceAll('&#039;', "'")
    .replaceAll('&#039;?', '');
