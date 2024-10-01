import Layout from '@/app/components/Layout'
import withAuth from '@/app/components/withAuth'
import React from 'react'

const About = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">About Loons Team Balancer</h1>
        <p className="text-lg leading-relaxed mb-4">
          Loons Team Balancer is a Next.js-based solution designed to create
          fair and well-balanced soccer teams each week. The app takes into
          account player skills, gender, and other attributes to ensure a fun
          and competitive experience for everyone. It is ideal for recurring
          games with a mix of players of different abilities and positions,
          making it easy to shuffle teams fairly every time.
        </p>
        <p className="text-lg leading-relaxed mb-4">
          At the core of the app is a team balancing algorithm. It evaluates the
          players available each week based on their attack, defense, and
          fitness scores. Players are sorted primarily by gender and then by
          overall score. Using a modified serpentine draft method, the algorithm
          distributes players across teams while keeping the overall skill
          levels balanced. It even introduces slight randomness to ensure that
          teams vary week to week.
        </p>
        <p className="text-lg leading-relaxed">
          The app also tracks the ratio of players by gender to ensure
          inclusivity. Whether the group has an even or odd number of players,
          or an unbalanced mix of skillsets, the Loons Team Balancer aims for
          fairness in team distribution, fostering an enjoyable game for all
          participants.
        </p>
      </div>
    </Layout>
  )
}

export default withAuth(About)
