import React from 'react'

export default async function CoverLetter({ params }) {
    const { id } = await params;
    console.log(id);
    return (
        <div>CoverLetter: {id}</div>
    )
}