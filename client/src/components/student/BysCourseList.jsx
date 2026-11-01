export default function BysCourseList({ courses, message, error }) {
  const grouped = courses.reduce((groups, course) => {
    const year = course.yazilmaAkademikYil || 'Akademik yıl belirtilmemiş';
    const term = course.yazilmaAkademikDonemTuru || 'Dönem belirtilmemiş';
    groups[year] ||= {};
    groups[year][term] ||= [];
    groups[year][term].push(course);
    return groups;
  }, {});

  return (
    <>
      <p className={`form-message ${error ? 'error' : 'success'}`}>{message}</p>

      {Object.entries(grouped).map(([year, terms]) => (
        <section className="department-course-group" key={year}>
          <h3>{year}</h3>
          {Object.entries(terms).map(([term, termCourses]) => (
            <div className="course-term-group" key={term}>
              <h4>{term}</h4>
              <ul>
                {termCourses.map((course, index) => (
                  <li key={`${course.dersId}-${index}`}>
                    <strong>{course.dersKodu || '-'}</strong> {course.dersAd || '-'}
                    <span>Şube: {course.subeAd || '-'}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
