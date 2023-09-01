import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  findFirstCategoryLink,
  useDocById,
} from '@docusaurus/theme-common/internal';
import isInternalUrl from '@docusaurus/isInternalUrl';
import {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';
import IconBox from '../../components/IconBox';
function CardContainer({href, cover, children}) {
  return (
    <Link
      style={{
        backgroundImage: cover,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      }}
      href={href}
      className={clsx('card padding--md', styles.cardContainer)}>
      {children}
    </Link>
  );
}
function CardLayout({href, icon, title, cover, description}) {
  return (
    <CardContainer href={href} cover={cover}>
      {icon}
      <span
      className={clsx('text--truncate', styles.cardTitle)} title={title}>
      {title}
      </span>
      {description && (
        <p
          className={clsx('text--wrap', styles.cardDescription)}
          
          title={description}>
          {description}
        </p>
      )}
    </CardContainer>
  );
}
function CardCategory({item}) {
  const href = findFirstCategoryLink(item);
  // Unexpected: categories that don't have a link have been filtered upfront
  if (!href) {
    return null;
  }
  return (
    <CardLayout
      href={href}
      icon="🗃️"
      title={item.label}
      cover={item.cover}
      description={
        item.description ??
        translate(
          {
            message: '{count} items',
            id: 'theme.docs.DocCard.categoryDescription',
            description:
              'The default description for a category card in the generated index about how many items this category includes',
          },
          {count: item.items.length},
        )
      }
    />
  );
}
function CardLink({item}) {
  const doc = useDocById(item.docId ?? undefined);
  let icon = "";
  if(item.customProps?.icon){
    icon = (
      <IconBox logo={item.customProps?.icon} />
    )
  }else {
    icon = isInternalUrl(item.href) ? '📄️' : '🔗';
  }

  return (
    <CardLayout
      href={item.href}
      icon={icon}
      title={item.label}
      cover={item.customProps?.cover}
      description={item.description ?? doc?.description}
    />
  );
}
export default function DocCard({item}) {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;
    case 'category':
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
