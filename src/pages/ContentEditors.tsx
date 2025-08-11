import React from 'react'
import ProjectsEditor from './ProjectsEditor'
import ArticlesEditor from './ArticlesEditor'
import ExperiencesEditor from './ExperiencesEditor'

export default function ContentEditors(){
  return (
    <div className="space-y-8">
      <ProjectsEditor />
      <ArticlesEditor />
      <ExperiencesEditor />
    </div>
  )
}
