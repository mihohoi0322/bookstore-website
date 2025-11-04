import { Book } from './domain.js';

export const seedBooks: Book[] = [
  {
    id: '1',
    title: '風の谷の物語',
    author: '山田花子',
    description: '美しい風景と心温まる人々の物語。四季折々の自然が織りなす、忘れられない感動作。',
    fullDescription:
      '美しい風景と心温まる人々の物語。四季折々の自然が織りなす、忘れられない感動作。',
    imageUrl: null,
    price: 1800,
    status: 'available',
    tags: ['文学', '日本文学', '自然'],
    publicationYear: 2023,
    publicationStatus: 'published'
  },
  {
    id: '2',
    title: '星空を駆ける少年',
    author: '佐藤太一',
    description: '宇宙に憧れる少年の冒険譚。友情と挑戦の物語。',
    fullDescription:
      '宇宙に憧れる少年が仲間とともにロケットを作り、未知の世界へ挑む感動のストーリー。',
    imageUrl: null,
    price: 2200,
    status: 'coming-soon',
    tags: ['SF', '冒険'],
    publicationYear: 2024,
    publicationStatus: 'draft'
  },
  {
    id: '3',
    title: '珈琲店の午後',
    author: '中村絵里',
    description: '下町の小さな珈琲店を舞台にしたヒューマンドラマ。',
    fullDescription: '珈琲の香りと人々の想いが交差する、優しく温かな連作短編集。',
    imageUrl: null,
    price: 1500,
    status: 'available',
    tags: ['ヒューマン', '短編'],
    publicationYear: 2021,
    publicationStatus: 'published'
  }
];
