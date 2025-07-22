import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(1).max(50),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required().custom((slug) => {
          if (!slug?.current) {
            return 'Slug is required'
          }
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.current)) {
            return 'Slug must be lowercase and can only contain letters, numbers, and hyphens'
          }
          return true
        }),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        {
          title: 'Block',
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
        },
      ],
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email().max(100),
    }),
    defineField({
      name: 'socials',
      title: 'Socials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  {title: 'Twitter', value: 'twitter'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'GitHub', value: 'github'},
                  {title: 'Website', value: 'website'},
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.uri({allowRelative: false}).required(),
            },
          ],
          preview: {
            select: {
              title: 'platform',
              url: 'url',
            },
            prepare({title, url}) {
              return {
                title,
                subtitle: url,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      slug: 'slug.current',
    },
  },
})
