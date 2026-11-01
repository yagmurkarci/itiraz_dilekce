import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { bysService } from '../services/bys.service.js';
import { courseService } from '../services/course.service.js';
import { requestService } from '../services/request.service.js';
import Page from '../components/ui/Page.jsx';
import Panel from '../components/ui/Panel.jsx';
import RequestForm from '../components/requests/RequestForm.jsx';
import StudentRequestsList from '../components/requests/StudentRequestsList.jsx';
import StaffRequestsTable from '../components/requests/StaffRequestsTable.jsx';

export default function RequestsPage() {
  const { userId, profile, isStudent, isStudentAffairs, isManager, hasAcademicRole } = useAuth();
  const { showNotification } = useNotification();

  const isInstructorOnly = hasAcademicRole && !isManager && !isStudentAffairs;

  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);

  const load = useCallback(async () => {
    try {
      if (isStudent) {
        const [departmentCourses, bysData, ownRequests] = await Promise.all([
          courseService.getStudentDepartmentCourses(),
          profile?.bysStudentId
            ? bysService.studentCourses(profile.bysStudentId)
            : Promise.resolve({ dersler: [] }),
          requestService.getByUser(userId),
        ]);

        const bysIds = new Set(
          (bysData.dersler || [])
            .map((course) => Number(course.dersId))
            .filter((id) => Number.isInteger(id) && id > 0)
        );

        setCourses(
          departmentCourses.filter(
            (course) => course.bysCourseId && bysIds.has(Number(course.bysCourseId))
          )
        );
        setRequests(ownRequests);
        return;
      }

      setRequests(isInstructorOnly ? await requestService.getAssigned() : await requestService.getAll());
    } catch (error) {
      showNotification('error', 'Veriler Yüklenemedi', error.message);
    }
  }, [isStudent, isInstructorOnly, profile, userId, showNotification]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitRequest(form) {
    const selectedCourse = courses.find((course) => course.id === Number(form.courseId));

    if (!selectedCourse || !form.title.trim() || !form.description.trim()) {
      showNotification('error', 'Eksik Bilgi', 'Ders, konu ve detay alanları zorunludur.');
      throw new Error('validation');
    }

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        requestType: 'EXAM_APPEAL',
        courseId: selectedCourse.id,
        departmentId: selectedCourse.departmentId,
        attachments: [],
      };

      const request = editingRequest
        ? await requestService.update(editingRequest.id, payload)
        : await requestService.create(payload);

      if (form.file) {
        await requestService.uploadAttachment(form.file, request.id);
      }

      showNotification(
        'success',
        editingRequest ? 'Dilekçe Güncellendi' : 'Dilekçe Gönderildi',
        editingRequest ? 'Dilekçeniz başarıyla güncellendi.' : 'Dilekçeniz başarıyla gönderildi.'
      );
      setEditingRequest(null);
      await load();
    } catch (error) {
      showNotification('error', 'Dilekçe Gönderilemedi', error.message);
      throw error;
    }
  }

  async function deleteRequest(id) {
    if (!window.confirm('Bu dilekçeyi silmek istiyor musunuz?')) return;

    try {
      await requestService.remove(id);
      showNotification('success', 'Dilekçe Silindi', 'Dilekçe kaldırıldı.');
      await load();
    } catch (error) {
      showNotification('error', 'Silinemedi', error.message);
    }
  }

  async function forwardRequest(id, instructorId) {
    if (!instructorId) {
      showNotification('error', 'Hoca Seçilmedi', 'Derse atanmış bir hoca seçin.');
      return;
    }

    try {
      await requestService.forward(id, Number(instructorId));
      showNotification('success', 'İşlem Tamamlandı', 'Dilekçe ilgili hocaya yönlendirildi.');
      await load();
    } catch (error) {
      showNotification('error', 'İşlem Başarısız', error.message);
    }
  }

  async function rejectRequest(id, reason) {
    if (!reason.trim()) {
      showNotification('error', 'Ret Gerekçesi', 'Ret gerekçesi yazın.');
      return;
    }

    try {
      await requestService.reject(id, reason.trim());
      showNotification('success', 'İşlem Tamamlandı', 'Dilekçe gerekçesiyle reddedildi.');
      await load();
    } catch (error) {
      showNotification('error', 'İşlem Başarısız', error.message);
    }
  }

  async function replyRequest(id, file, answer) {
    if (!file) {
      showNotification('error', 'Dosya Gerekli', 'Yanıtlamadan önce incelenmiş sınav kağıdını yükleyin.');
      return;
    }
    if (!answer.trim()) {
      showNotification('error', 'Yanıt Gerekli', 'İnceleme yanıtını yazın.');
      return;
    }

    try {
      await requestService.uploadAttachment(file, id);
      await requestService.reply(id, answer.trim());
      showNotification('success', 'İşlem Tamamlandı', 'Sınav kağıdı yüklendi ve yanıt öğrenciye iletildi.');
      await load();
    } catch (error) {
      showNotification('error', 'İşlem Başarısız', error.message);
    }
  }

  if (isStudent) {
    return (
      <Page>
        <Panel title="Sınav İtiraz Dilekçesi" className="form-panel">
          <RequestForm
            courses={courses}
            initial={
              editingRequest
                ? {
                    courseId: String(editingRequest.courseId),
                    title: editingRequest.title,
                    description: editingRequest.description,
                    file: null,
                  }
                : undefined
            }
            editing={Boolean(editingRequest)}
            onSubmit={submitRequest}
            onCancel={() => setEditingRequest(null)}
          />
        </Panel>

        <Panel title="Dilekçelerim">
          <StudentRequestsList
            requests={requests}
            onEdit={setEditingRequest}
            onDelete={deleteRequest}
          />
        </Panel>
      </Page>
    );
  }

  return (
    <Page>
      <Panel title="Dilekçe İnceleme Kuyruğu" className="table-panel">
        <StaffRequestsTable
          requests={requests}
          userId={userId}
          hasAcademicRole={hasAcademicRole}
          canManage={isManager || isStudentAffairs}
          onForward={forwardRequest}
          onReject={rejectRequest}
          onReply={replyRequest}
        />
      </Panel>
    </Page>
  );
}
