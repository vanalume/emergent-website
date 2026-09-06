# New Page - Blogs
- We need another page listing out blogs
- Admin user needs to be able to update the blogs
    - Have a wysiwyg element from Quill.js, modify it to fit our website theme but the functionality should stay intact
    - Derive a schema from this markdown content to store it on the backend
    - Any uploaded in the blog should be served from our s3 storage object, where a different folder exists "blog/<blog-name>-<slug>/" to keep the images of the blog
- Each blog stored in the backend need to be visible in the frontend in the "Blogs" page
    - Blog Card: Design blog card conforming to the current theme and design guidelines of the website
    - Blog Content: 
        - The content should remain centered
        - Headings, paragraphs and other design configs defined in the wysiwyg component should be visible

